import { useParams, Link } from 'react-router-dom';
import useWebSocket from '../hooks/useWebSocket';
import { useFileReceiver } from '../hooks/useFileReceiver';
import ConnectionStatus from './ConnectionStatus';
import ProgressBar from './ProgressBar';
import FilePreview from './FilePreview';

function ReceivePage() {
    const { roomId } = useParams();
    const { isConnected, send, on } = useWebSocket();

    const {
        status,
        receivedFiles,
        currentFileMetadata,
        progress,
        totalFiles,
        currentFileIndex,
        togglePause
    } = useFileReceiver(roomId, isConnected, send, on);

    // Download single file
    const downloadFile = (fileData) => {
        const url = URL.createObjectURL(fileData.file);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileData.metadata.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Download all files
    const downloadAll = () => {
        receivedFiles.forEach((fileData, index) => {
            setTimeout(() => {
                downloadFile(fileData);
            }, index * 500); // Stagger downloads
        });
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
                    <h1 className="text-2xl font-bold text-gradient">Receive Files</h1>
                </div>

                {/* Connection Status */}
                {status !== 'complete' && (
                    <div className="mb-6">
                        <ConnectionStatus status={status === 'waiting-next' ? 'receiving' : status} />
                        {status === 'connected' && (
                            <p className="text-center text-slate-500 dark:text-gray-400 mt-2">Waiting for sender to start transfer...</p>
                        )}
                    </div>
                )}

                {/* Receiving Progress */}
                {(status === 'receiving' || status === 'waiting-next') && currentFileMetadata && (
                    <div className="card mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Receiving File {currentFileIndex + 1} of {totalFiles}
                            </h3>
                            <span className="text-sm text-slate-500 dark:text-gray-400">
                                {((currentFileIndex / totalFiles) * 100).toFixed(0)}% Overall
                            </span>
                        </div>

                        {/* Overall Progress Bar */}
                        <div className="w-full bg-slate-200 dark:bg-dark-800 rounded-full h-2 mb-6">
                            <div
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${((currentFileIndex + (progress.progress / 100)) / totalFiles) * 100}%` }}
                            ></div>
                        </div>

                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium text-slate-600 dark:text-gray-300">
                                Current File: {currentFileMetadata.name}
                            </h4>
                            <button
                                onClick={togglePause}
                                className="btn-secondary py-1 px-3 text-xs flex items-center space-x-1"
                            >
                                {progress.paused ? (
                                    <>
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                        <span>Resume</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                        </svg>
                                        <span>Pause</span>
                                    </>
                                )}
                            </button>
                        </div>
                        {progress.paused && <p className="text-yellow-600 dark:text-yellow-400 text-xs font-bold mb-2">⏸ Transfer Paused</p>}
                        <ProgressBar {...progress} />
                    </div>
                )}

                {/* Received Files List */}
                {receivedFiles.length > 0 && (
                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Received Files ({receivedFiles.length}/{totalFiles || receivedFiles.length})</h3>
                            {receivedFiles.length > 1 && (
                                <button
                                    onClick={downloadAll}
                                    className="btn-primary py-1 px-4 text-sm"
                                >
                                    Download All
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {receivedFiles.map((fileData, index) => (
                                <div key={index} className="bg-slate-100 dark:bg-dark-800 rounded-lg p-4 transition-all duration-300 hover:bg-slate-200 dark:hover:bg-dark-700 hover:shadow-lg hover:scale-[1.01] group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                <svg className="w-8 h-8 text-green-500 dark:text-green-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{fileData.metadata.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-gray-400">
                                                    {(fileData.metadata.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => downloadFile(fileData)}
                                            className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm flex items-center hover:scale-105 transition-transform duration-200"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download
                                        </button>
                                    </div>

                                    {/* File Preview */}
                                    <FilePreview file={fileData.file} metadata={fileData.metadata} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReceivePage;
