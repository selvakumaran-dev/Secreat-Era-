/**
 * File Preview Component
 * Displays preview for images and videos
 */
function FilePreview({ file, metadata }) {
    const isImage = metadata?.mimeType?.startsWith('image/');
    const isVideo = metadata?.mimeType?.startsWith('video/');

    if (!file) return null;

    const fileUrl = URL.createObjectURL(file);

    return (
        <div className="card">
            <h3 className="text-lg font-semibold mb-4">File Preview</h3>

            <div className="bg-dark-800 rounded-lg p-4">
                {isImage && (
                    <img
                        src={fileUrl}
                        alt={metadata.name}
                        className="max-w-full max-h-96 mx-auto rounded-lg"
                    />
                )}

                {isVideo && (
                    <video
                        src={fileUrl}
                        controls
                        className="max-w-full max-h-96 mx-auto rounded-lg"
                    >
                        Your browser does not support video playback.
                    </video>
                )}

                {!isImage && !isVideo && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-400">Preview not available for this file type</p>
                    </div>
                )}
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                    <span>File name:</span>
                    <span className="text-white font-medium">{metadata?.name}</span>
                </div>
                <div className="flex justify-between">
                    <span>File size:</span>
                    <span className="text-white font-medium">
                        {metadata?.size ? (metadata.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>File type:</span>
                    <span className="text-white font-medium">{metadata?.mimeType || 'Unknown'}</span>
                </div>
            </div>
        </div>
    );
}

export default FilePreview;
