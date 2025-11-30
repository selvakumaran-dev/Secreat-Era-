/**
 * Progress Bar Component
 * Displays file transfer progress with speed and ETA
 */
function ProgressBar({ progress = 0, speed = 0, transferred = 0, total = 0 }) {
    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatSpeed = (mbps) => {
        if (mbps < 0.01) return '0 KB/s';
        if (mbps < 1) return Math.round(mbps * 1024) + ' KB/s';
        return mbps.toFixed(2) + ' MB/s';
    };

    const formatTime = (seconds) => {
        if (!seconds || !isFinite(seconds)) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const remaining = speed > 0 ? (total - transferred) / (speed * 1024 * 1024) : 0;

    return (
        <div className="w-full space-y-3">
            {/* Progress bar */}
            <div className="relative h-3 bg-dark-700 rounded-full overflow-hidden">
                <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
            </div>

            {/* Stats */}
            <div className="flex justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                    <span className="font-semibold text-white">
                        {Math.round(progress)}%
                    </span>
                    <span>
                        {formatBytes(transferred)} / {formatBytes(total)}
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>{formatSpeed(speed)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatTime(remaining)}</span>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ProgressBar;
