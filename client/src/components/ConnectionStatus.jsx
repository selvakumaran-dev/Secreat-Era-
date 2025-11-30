/**
 * Connection Status Component
 * Displays current connection state with visual indicators
 */
function ConnectionStatus({ status }) {
    const statusConfig = {
        disconnected: {
            text: 'Disconnected',
            color: 'text-gray-400',
            bgColor: 'bg-gray-500/20',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                </svg>
            )
        },
        waiting: {
            text: 'Waiting for receiver...',
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/20',
            icon: (
                <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        connecting: {
            text: 'Securely connecting...',
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/20',
            icon: (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            )
        },
        connected: {
            text: 'Connected securely',
            color: 'text-green-400',
            bgColor: 'bg-green-500/20',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        receiving: {
            text: 'Receiving file...',
            color: 'text-primary-400',
            bgColor: 'bg-primary-500/20',
            icon: (
                <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 11l3 3m0 0l3-3m-3 3V4" />
                </svg>
            )
        },
        transferring: {
            text: 'Encrypted transfer in progress...',
            color: 'text-primary-400',
            bgColor: 'bg-primary-500/20',
            icon: (
                <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            )
        },
        complete: {
            text: 'Transfer complete!',
            color: 'text-green-400',
            bgColor: 'bg-green-500/20',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )
        },
        failed: {
            text: 'Transfer failed',
            color: 'text-red-400',
            bgColor: 'bg-red-500/20',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )
        }
    };

    const config = statusConfig[status] || statusConfig.disconnected;

    return (
        <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${config.bgColor}`}>
            <div className={config.color}>
                {config.icon}
            </div>
            <span className={`font-medium ${config.color}`}>
                {config.text}
            </span>
        </div>
    );
}

export default ConnectionStatus;
