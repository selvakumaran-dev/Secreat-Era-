/**
 * File transfer utilities for WebRTC DataChannel
 * Handles chunking, progress tracking, and reassembly
 */

const CHUNK_SIZE = 16384; // 16KB chunks
const TURBO_CHUNK_SIZE = 65536; // 64KB chunks for Turbo Mode
const BUFFER_THRESHOLD = 16 * 1024 * 1024; // 16MB buffer limit

/**
 * File sender class
 */
export class FileSender {
    constructor(file, dataChannel, onProgress) {
        this.file = file;
        this.dataChannel = dataChannel;
        this.onProgress = onProgress;
        this.offset = 0;
        this.startTime = null;
        this.isPaused = false;
        this.resumeResolve = null;
        this.turboMode = false;

        // Listen for incoming control messages from receiver
        this.setupControlListener();
    }

    setupControlListener() {
        this.dataChannel.addEventListener('message', (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'control') {
                    if (message.action === 'pause') {
                        this.pause();
                    } else if (message.action === 'resume') {
                        this.resume();
                    }
                }
            } catch (e) {
                // Ignore non-JSON messages (like file chunks if any)
            }
        });
    }

    /**
     * Pause transfer
     */
    pause() {
        if (!this.isPaused) {
            console.log('[FileSender] Pausing transfer');
            this.isPaused = true;
            try {
                this.dataChannel.send(JSON.stringify({ type: 'control', action: 'pause' }));
            } catch (e) {
                console.error('Error sending pause signal', e);
            }
        }
    }

    /**
     * Resume transfer
     */
    resume() {
        if (this.isPaused) {
            console.log('[FileSender] Resuming transfer');
            this.isPaused = false;
            if (this.resumeResolve) {
                this.resumeResolve();
                this.resumeResolve = null;
            }
            try {
                this.dataChannel.send(JSON.stringify({ type: 'control', action: 'resume' }));
            } catch (e) {
                console.error('Error sending resume signal', e);
            }
        }
    }

    /**
     * Send file metadata
     */
    async sendMetadata(encryptionKey, fileIndex = 0, totalFiles = 1) {
        const metadata = {
            type: 'metadata',
            name: this.file.name,
            size: this.file.size,
            mimeType: this.file.type,
            encryptionKey: encryptionKey,
            fileIndex: fileIndex,
            totalFiles: totalFiles
        };

        this.dataChannel.send(JSON.stringify(metadata));
    }

    /**
     * Helper to read a chunk as ArrayBuffer
     */
    readChunk(offset, size) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(new Uint8Array(e.target.result));
            reader.onerror = (e) => reject(new Error('File read error: ' + e.target.error));
            reader.readAsArrayBuffer(this.file.slice(offset, offset + size));
        });
    }

    /**
     * Send file in chunks
     */
    async sendFile(encryptFile, turboMode = false) {
        console.log('[FileSender] Starting file transfer:', this.file.name, this.file.size, 'bytes', 'Turbo:', turboMode);
        this.startTime = Date.now();
        this.turboMode = turboMode;

        // Use larger chunks for Turbo Mode
        const currentChunkSize = this.turboMode ? TURBO_CHUNK_SIZE : CHUNK_SIZE;

        try {
            while (this.offset < this.file.size) {
                // 1. Check Pause State
                if (this.isPaused) {
                    await new Promise(resolve => this.resumeResolve = resolve);
                }

                // 2. Check Backpressure (Turbo Mode logic)
                // If buffer is full, wait for it to drain
                if (this.dataChannel.bufferedAmount > BUFFER_THRESHOLD) {
                    await new Promise(resolve => {
                        const handler = () => {
                            this.dataChannel.removeEventListener('bufferedamountlow', handler);
                            resolve();
                        };
                        this.dataChannel.addEventListener('bufferedamountlow', handler);
                    });
                }

                // 3. Read Chunk
                const chunk = await this.readChunk(this.offset, currentChunkSize);

                // 4. Encrypt Chunk
                const encryptedChunk = await encryptFile(chunk);

                // 5. Send Chunk
                this.dataChannel.send(encryptedChunk);
                this.offset += chunk.length;

                // 6. Update Progress
                // Don't update on every chunk in Turbo Mode to save CPU, maybe every 10th?
                // For now, keep it simple.
                const progress = (this.offset / this.file.size) * 100;
                const elapsed = (Date.now() - this.startTime) / 1000; // seconds
                const speed = elapsed > 0 ? this.offset / elapsed / 1024 / 1024 : 0; // MB/s
                const remaining = speed > 0 ? (this.file.size - this.offset) / (speed * 1024 * 1024) : 0;

                if (this.onProgress) {
                    this.onProgress({
                        progress,
                        speed,
                        remaining,
                        transferred: this.offset,
                        total: this.file.size,
                        paused: this.isPaused
                    });
                }

                // If NOT in Turbo Mode, we might want to yield or wait a tiny bit to be "gentle"
                // But relying on bufferedAmount is generally best practice anyway.
                // We'll just let the loop run.
            }

            // Transfer complete
            console.log('[FileSender] All chunks sent, sending complete message');
            this.dataChannel.send(JSON.stringify({ type: 'complete' }));

        } catch (error) {
            console.error('[FileSender] Error sending file:', error);
            throw error;
        }
    }
}

/**
 * File receiver class
 */
export class FileReceiver {
    constructor(onProgress, onComplete) {
        this.chunks = [];
        this.metadata = null;
        this.receivedSize = 0;
        this.onProgress = onProgress;
        this.onComplete = onComplete;
        this.startTime = null;
        this.isPaused = false;
        this.dataChannel = null; // Need reference to send control messages
    }

    /**
     * Set data channel for sending control messages
     */
    setDataChannel(dataChannel) {
        this.dataChannel = dataChannel;
    }

    /**
     * Send control message to sender
     */
    sendControl(action) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            console.log(`[FileReceiver] Sending ${action} signal`);
            this.dataChannel.send(JSON.stringify({ type: 'control', action }));

            if (action === 'pause') {
                this.isPaused = true;
            } else if (action === 'resume') {
                this.isPaused = false;
            }
        }
    }

    /**
     * Toggle pause/resume
     */
    togglePause() {
        if (this.isPaused) {
            this.sendControl('resume');
        } else {
            this.sendControl('pause');
        }
    }

    /**
     * Handle incoming data
     */
    async handleData(data, decryptChunk) {
        // Check if it's a control message or complete message
        if (typeof data === 'string') {
            try {
                const message = JSON.parse(data);

                if (message.type === 'complete') {
                    console.log('[FileReceiver] Received complete message');
                    await this.assembleFile(decryptChunk);
                    return;
                } else if (message.type === 'control') {
                    if (message.action === 'pause') {
                        this.isPaused = true;
                        if (this.onProgress && this.metadata) {
                            // Send update with paused state
                            this.onProgress({
                                progress: (this.receivedSize / this.metadata.size) * 100,
                                speed: 0,
                                remaining: 0,
                                transferred: this.receivedSize,
                                total: this.metadata.size,
                                paused: true
                            });
                        }
                    } else if (message.action === 'resume') {
                        this.isPaused = false;
                    }
                    return;
                }
            } catch (error) {
                console.error('[FileReceiver] Error parsing message:', error);
            }
        }

        // It's a file chunk
        if (data instanceof ArrayBuffer) {
            this.chunks.push(data);
            this.receivedSize += data.byteLength;

            if (this.metadata && this.onProgress) {
                const progress = (this.receivedSize / this.metadata.size) * 100;
                const elapsed = (Date.now() - this.startTime) / 1000;
                const speed = elapsed > 0 ? this.receivedSize / elapsed / 1024 / 1024 : 0; // MB/s
                const remaining = speed > 0 ? (this.metadata.size - this.receivedSize) / (speed * 1024 * 1024) : 0;

                this.onProgress({
                    progress,
                    speed,
                    remaining,
                    transferred: this.receivedSize,
                    total: this.metadata.size,
                    paused: this.isPaused
                });
            }
        }
    }

    /**
     * Assemble received chunks into file
     */
    async assembleFile(decryptChunk) {
        if (!this.metadata) {
            throw new Error('No metadata received');
        }

        console.log('[FileReceiver] Assembling file from', this.chunks.length, 'chunks');

        // Decrypt and combine chunks
        const decryptedChunks = [];
        for (const chunk of this.chunks) {
            const decrypted = await decryptChunk(chunk);
            decryptedChunks.push(decrypted);
        }

        const blob = new Blob(decryptedChunks, { type: this.metadata.mimeType });

        if (this.onComplete) {
            this.onComplete({
                file: blob,
                metadata: this.metadata
            });
        }
    }
}
