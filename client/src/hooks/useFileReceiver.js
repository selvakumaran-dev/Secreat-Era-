import { useState, useEffect, useRef } from 'react';
import WebRTCManager from '../webrtc/webrtcManager';
import { FileReceiver } from '../webrtc/fileTransfer';
import { importKey, createEncryptionUtils } from '../crypto/encryption';

/**
 * Custom hook for file receiving logic
 */
export function useFileReceiver(roomId, isConnected, send, on) {
    const [status, setStatus] = useState('disconnected');
    const [receivedFiles, setReceivedFiles] = useState([]);
    const [currentFileMetadata, setCurrentFileMetadata] = useState(null);
    const [progress, setProgress] = useState({ progress: 0, speed: 0, transferred: 0, total: 0 });
    const [totalFiles, setTotalFiles] = useState(0);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);

    const webrtcRef = useRef(null);
    const fileReceiverRef = useRef(null);
    const encryptionKeyRef = useRef(null);

    // Join room when connected
    useEffect(() => {
        if (isConnected && roomId) {
            send({ type: 'join-room', roomId });
            // Only set to connecting if we're currently disconnected
            setStatus(prev => prev === 'disconnected' ? 'connecting' : prev);
        }
    }, [isConnected, roomId, send]);

    // Debug: Log status changes
    useEffect(() => {
        console.log('[useFileReceiver] Status changed to:', status);
    }, [status]);

    // Initialize WebRTC
    const initializeWebRTC = async (offer) => {
        try {
            // Create WebRTC manager
            webrtcRef.current = new WebRTCManager(
                async (data) => {
                    // Handle incoming data
                    if (typeof data === 'string') {
                        try {
                            const message = JSON.parse(data);

                            if (message.type === 'metadata') {
                                console.log('[useFileReceiver] Received metadata:', message);
                                setCurrentFileMetadata(message);
                                setTotalFiles(message.totalFiles || 1);
                                setCurrentFileIndex(message.fileIndex || 0);
                                setStatus('receiving');

                                // Import encryption key
                                encryptionKeyRef.current = await importKey(message.encryptionKey);

                                // Create NEW FileReceiver for this file
                                fileReceiverRef.current = new FileReceiver(
                                    (progressData) => setProgress(progressData),
                                    (result) => {
                                        console.log('[useFileReceiver] File received:', result.metadata.name);
                                        setReceivedFiles(prev => [...prev, result]);

                                        // Check if all files received
                                        if ((message.fileIndex || 0) + 1 >= (message.totalFiles || 1)) {
                                            setStatus('complete');
                                        } else {
                                            // Wait for next file
                                            setStatus('waiting-next');
                                        }
                                    }
                                );

                                // Set data channel for control messages
                                fileReceiverRef.current.setDataChannel(webrtcRef.current.dataChannel);

                                // Pass metadata to FileReceiver
                                fileReceiverRef.current.metadata = message;
                                fileReceiverRef.current.startTime = Date.now();
                                return;
                            }
                        } catch (error) {
                            console.error('[useFileReceiver] Error parsing message:', error);
                        }
                    }

                    // Handle file data (chunks and complete message)
                    if (fileReceiverRef.current && encryptionKeyRef.current) {
                        const { decryptChunk } = createEncryptionUtils(encryptionKeyRef.current);
                        await fileReceiverRef.current.handleData(data, decryptChunk);
                    } else {
                        console.warn('[useFileReceiver] Received data but FileReceiver or encryption key not ready');
                    }
                },
                (state) => {
                    console.log('[useFileReceiver] Connection state:', state);
                    if (state === 'connected') {
                        setStatus('connected'); // Ready for file
                    } else if (state === 'failed') {
                        setStatus('failed');
                    }
                }
            );

            // Initialize peer connection
            webrtcRef.current.initializePeerConnection();

            // Set ICE candidate handler
            webrtcRef.current.setOnIceCandidate((candidate) => {
                send({
                    type: 'ice-candidate',
                    roomId,
                    candidate
                });
            });

            // Set remote description (offer)
            await webrtcRef.current.setRemoteDescription(offer);

            // Create and send answer
            const answer = await webrtcRef.current.createAnswer();
            send({
                type: 'answer',
                roomId,
                answer
            });

            // Check if already connected (race condition fix)
            const currentState = webrtcRef.current.getConnectionState();
            console.log('[useFileReceiver] Current connection state after setup:', currentState);
            if (currentState === 'connected') {
                setStatus('connected');
            }

        } catch (error) {
            console.error('[useFileReceiver] Error initializing WebRTC:', error);
            setStatus('failed');
        }
    };

    // Handle WebSocket messages
    useEffect(() => {
        if (!on) return;

        const unsubscribers = [];

        // User joined (sender connected)
        unsubscribers.push(on('user-joined', () => {
            console.log('[useFileReceiver] Sender joined');
            setStatus('connected');
        }));

        // WebRTC offer received
        unsubscribers.push(on('offer', async (message) => {
            console.log('[useFileReceiver] Received offer');
            await initializeWebRTC(message.offer);
        }));

        // ICE candidate received
        unsubscribers.push(on('ice-candidate', async (message) => {
            if (webrtcRef.current && message.candidate) {
                await webrtcRef.current.addIceCandidate(message.candidate);
            }
        }));

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [on]);

    // Toggle pause/resume
    const togglePause = () => {
        if (fileReceiverRef.current) {
            fileReceiverRef.current.togglePause();
        }
    };

    return {
        status,
        receivedFiles,
        currentFileMetadata,
        progress,
        totalFiles,
        currentFileIndex,
        togglePause
    };
}
