import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useWebSocket from '../hooks/useWebSocket';
import WebRTCManager from '../webrtc/webrtcManager';
import { FileSender } from '../webrtc/fileTransfer';
import { generateKey, exportKey, createEncryptionUtils } from '../crypto/encryption';
import ConnectionStatus from './ConnectionStatus';
import ProgressBar from './ProgressBar';

function SendPage() {
    const { roomId: urlRoomId } = useParams();
    const navigate = useNavigate();
    const { isConnected, send, on } = useWebSocket();

    const [roomId, setRoomId] = useState(urlRoomId || null);
    const [files, setFiles] = useState([]);
    const [status, setStatus] = useState('disconnected');
    const [progress, setProgress] = useState({ progress: 0, speed: 0, transferred: 0, total: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [shareableLink, setShareableLink] = useState('');
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [overallProgress, setOverallProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [turboMode, setTurboMode] = useState(false);

    const webrtcRef = useRef(null);
    const encryptionKeyRef = useRef(null);
    const fileInputRef = useRef(null);
    const currentSenderRef = useRef(null);

    // Create room when component mounts
    useEffect(() => {
        if (isConnected && !roomId) {
            send({ type: 'create-room' });
        }
    }, [isConnected, roomId]);

    // Handle WebSocket messages
    useEffect(() => {
        if (!on) return;

        const unsubscribers = [];

        // Room created
        unsubscribers.push(on('room-created', (message) => {
            const newRoomId = message.roomId;
            setRoomId(newRoomId);
            setShareableLink(`${window.location.origin}/receive/${newRoomId}`);
            setStatus('waiting');
            console.log('[SendPage] Room created:', newRoomId);
        }));

        // User joined (receiver connected)
        unsubscribers.push(on('user-joined', async (message) => {
            console.log('[SendPage] Receiver joined');
            setStatus('connecting');
            await initializeWebRTC();
        }));

        // WebRTC answer received
        unsubscribers.push(on('answer', async (message) => {
            console.log('[SendPage] Received answer');
            if (webrtcRef.current) {
                await webrtcRef.current.setRemoteDescription(message.answer);
            }
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

    // Initialize WebRTC connection
    const initializeWebRTC = async () => {
        try {
            // Create WebRTC manager
            webrtcRef.current = new WebRTCManager(
                null,
                (state) => {
                    console.log('[SendPage] Connection state:', state);
                    if (state === 'failed') {
                        setStatus('failed');
                    }
                }
            );

            // Initialize peer connection and create data channel
            webrtcRef.current.initializePeerConnection();
            webrtcRef.current.createDataChannel('fileTransfer');

            // Set data channel open handler
            webrtcRef.current.setOnDataChannelOpen(() => {
                console.log('[SendPage] Data channel is open and ready');
                setStatus('connected');
            });

            // Set ICE candidate handler
            webrtcRef.current.setOnIceCandidate((candidate) => {
                send({
                    type: 'ice-candidate',
                    roomId,
                    candidate
                });
            });

            // Create and send offer
            const offer = await webrtcRef.current.createOffer();
            send({
                type: 'offer',
                roomId,
                offer
            });

        } catch (error) {
            console.error('[SendPage] Error initializing WebRTC:', error);
            setStatus('failed');
        }
    };

    // Handle file selection (multiple)
    const handleFileSelect = (selectedFiles) => {
        if (selectedFiles && selectedFiles.length > 0) {
            const newFiles = Array.from(selectedFiles);
            setFiles(prev => [...prev, ...newFiles]);
            console.log('[SendPage] Files added:', newFiles.length);
        }
    };

    // Remove file from list
    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
            handleFileSelect(droppedFiles);
        }
    };

    // Toggle Pause/Resume
    const togglePause = () => {
        if (currentSenderRef.current) {
            if (isPaused) {
                currentSenderRef.current.resume();
                setIsPaused(false);
            } else {
                currentSenderRef.current.pause();
                setIsPaused(true);
            }
        }
    };

    // Send files sequentially
    const handleSendFiles = async () => {
        if (!files || files.length === 0 || !webrtcRef.current) return;

        // Check if data channel is open
        if (!webrtcRef.current.dataChannel || webrtcRef.current.dataChannel.readyState !== 'open') {
            alert('Data channel is not ready. Please wait for connection to establish.');
            console.error('[SendPage] Data channel not ready:', webrtcRef.current.dataChannel?.readyState);
            return;
        }

        try {
            setStatus('transferring');
            setIsPaused(false);
            const totalFiles = files.length;

            // Send files one by one
            for (let i = 0; i < totalFiles; i++) {
                const file = files[i];
                setCurrentFileIndex(i);
                console.log(`[SendPage] Sending file ${i + 1}/${totalFiles}: ${file.name}`);

                // Generate encryption key for this file
                encryptionKeyRef.current = await generateKey();
                const exportedKey = await exportKey(encryptionKeyRef.current);
                const { encryptChunk } = createEncryptionUtils(encryptionKeyRef.current);

                // Create file sender
                const sender = new FileSender(
                    file,
                    webrtcRef.current.dataChannel,
                    (progressData) => {
                        setProgress(progressData);
                        // Calculate overall progress
                        const filesCompleted = i;
                        const currentFileProgress = progressData.progress / 100;
                        const overall = ((filesCompleted + currentFileProgress) / totalFiles) * 100;
                        setOverallProgress(overall);
                    }
                );

                currentSenderRef.current = sender;

                // Send metadata (including encryption key and file index)
                await sender.sendMetadata(exportedKey, i, totalFiles);

                // Small delay to ensure metadata is processed
                await new Promise(resolve => setTimeout(resolve, 100));

                // Send file with Turbo Mode setting
                await sender.sendFile(encryptChunk, turboMode);

                console.log(`[SendPage] File ${i + 1}/${totalFiles} sent successfully`);

                // Small delay between files
                if (i < totalFiles - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            setStatus('complete');
            setOverallProgress(100);
            currentSenderRef.current = null;
            console.log('[SendPage] All files sent successfully');

        } catch (error) {
            console.error('[SendPage] Error sending files:', error);
            setStatus('failed');
            alert(`Error sending files: ${error.message}`);
        }
    };

    // Copy link to clipboard
    const copyLink = () => {
        navigator.clipboard.writeText(shareableLink);
        alert('Link copied to clipboard!');
    };

    // Reset for new transfer
    const handleReset = () => {
        setFiles([]);
        setStatus('connected');
        setProgress({ progress: 0, speed: 0, transferred: 0, total: 0 });
        setOverallProgress(0);
        setCurrentFileIndex(0);
        setIsPaused(false);
    };

    return (
        <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link to="/" className="flex items-center space-x-2 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Home</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gradient">Send Files</h1>
                </div>

                {/* Connection Status */}
                <div className="mb-6">
                    <ConnectionStatus status={status} />
                </div>

                {/* Room Link */}
                {roomId && (
                    <div className="card mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">Share this link with the receiver:</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={shareableLink}
                                readOnly
                                className="input-field flex-1 font-mono text-sm"
                            />
                            <button onClick={copyLink} className="btn-secondary px-4">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-gray-400 mt-2 flex justify-between items-center">
                            <span>Room Code: <span className="font-mono text-slate-900 dark:text-white">{roomId}</span></span>
                            <span className="text-xs text-yellow-600 dark:text-yellow-500/80">Link expires in 2 hours</span>
                        </p>
                    </div>
                )}

                {/* File Upload Area */}
                {status !== 'transferring' && status !== 'complete' && (
                    <div
                        className={`card border-2 border-dashed transition-all mb-6 ${isDragging
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-slate-300 dark:border-gray-600'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="text-center py-8">
                            <svg className="w-12 h-12 mx-auto mb-4 text-slate-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Drop files here</h3>
                            <p className="text-slate-500 dark:text-gray-400 mb-4">or</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={(e) => handleFileSelect(e.target.files)}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="btn-primary"
                            >
                                Choose Files
                            </button>
                        </div>
                    </div>
                )}

                {/* Selected Files List */}
                {files.length > 0 && (
                    <div className="card mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Selected Files ({files.length})</h3>
                            {status !== 'transferring' && status !== 'complete' && (
                                <button onClick={() => setFiles([])} className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">
                                    Clear All
                                </button>
                            )}
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {files.map((file, index) => (
                                <div key={index} className={`flex items-center justify-between p-3 bg-slate-100 dark:bg-dark-800 rounded-lg ${index === currentFileIndex && status === 'transferring' ? 'border border-primary-500' : ''}`}>
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                        <div className="flex-shrink-0">
                                            <svg className="w-6 h-6 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium truncate text-slate-900 dark:text-white">{file.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    {status !== 'transferring' && status !== 'complete' && (
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="text-slate-500 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 ml-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                    {status === 'transferring' && index === currentFileIndex && (
                                        <span className="text-xs text-primary-500 dark:text-primary-400 font-medium">Sending...</span>
                                    )}
                                    {status === 'transferring' && index < currentFileIndex && (
                                        <span className="text-xs text-green-500 dark:text-green-400 font-medium">Sent</span>
                                    )}
                                    {status === 'complete' && (
                                        <span className="text-xs text-green-500 dark:text-green-400 font-medium">Sent</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {status !== 'transferring' && status !== 'complete' && (
                            <div className="mt-4 space-y-4">
                                {/* Turbo Mode Toggle */}
                                <div className="flex items-center space-x-3 bg-slate-100 dark:bg-dark-800 p-3 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="turboMode"
                                        checked={turboMode}
                                        onChange={(e) => setTurboMode(e.target.checked)}
                                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 bg-white dark:bg-dark-700 border-slate-300 dark:border-gray-600"
                                    />
                                    <label htmlFor="turboMode" className="flex-1 cursor-pointer">
                                        <span className="font-medium text-slate-900 dark:text-white">Enable Turbo Mode ⚡</span>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">Optimizes transfer speed for large files (uses more bandwidth)</p>
                                    </label>
                                </div>

                                <button
                                    onClick={handleSendFiles}
                                    disabled={status !== 'connected'}
                                    className="btn-primary w-full"
                                >
                                    {status === 'connected' ? `Send ${files.length} Files` : 'Waiting for connection...'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Transfer Progress */}
                {status === 'transferring' && (
                    <div className="card">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sending File {currentFileIndex + 1} of {files.length}</h3>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={togglePause}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${isPaused
                                        ? 'bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/30'
                                        : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/30'
                                        }`}
                                >
                                    {isPaused ? '▶ Resume' : '⏸ Pause'}
                                </button>
                                <span className="text-sm text-slate-500 dark:text-gray-400">Overall: {overallProgress.toFixed(0)}%</span>
                            </div>
                        </div>

                        {/* Overall Progress Bar */}
                        <div className="w-full bg-slate-200 dark:bg-dark-800 rounded-full h-2 mb-6">
                            <div
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${overallProgress}%` }}
                            ></div>
                        </div>

                        <h4 className="text-sm font-medium mb-2 text-slate-600 dark:text-gray-300 flex justify-between">
                            <span>Current File: {files[currentFileIndex]?.name}</span>
                            {turboMode && <span className="text-xs text-primary-500 dark:text-primary-400">⚡ Turbo Active</span>}
                        </h4>
                        <ProgressBar {...progress} />
                    </div>
                )}

                {/* Transfer Complete */}
                {status === 'complete' && (
                    <div className="card text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">All Files Sent!</h3>
                        <p className="text-slate-500 dark:text-gray-400 mb-6">Successfully sent {files.length} files securely.</p>
                        <button
                            onClick={handleReset}
                            className="btn-primary"
                        >
                            Send More Files
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SendPage;
