import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

function HomePage() {
    const navigate = useNavigate();
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [joinRoomId, setJoinRoomId] = useState('');

    const handleJoinRoom = (e) => {
        e.preventDefault();
        if (joinRoomId.trim()) {
            navigate(`/receive/${joinRoomId.trim()}`);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Background Glows */}
            <div className="hero-glow bg-primary-500 top-0 left-1/4"></div>
            <div className="hero-glow bg-violet-500 bottom-0 right-1/4 animation-delay-2000"></div>

            {/* Navbar */}
            <nav className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Secure Era</span>
                </div>
                <div className="flex items-center space-x-6">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium">GitHub</a>
                    <a href="#features" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium">Features</a>
                    <ThemeToggle />
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
                <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary-300 text-xs font-medium mb-6 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                        v2.0 Now Available with Turbo Mode
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        Share files securely, <br />
                        <span className="text-gradient">without limits.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
                        Peer-to-peer, end-to-end encrypted file sharing. <br className="hidden md:block" />
                        No servers, no tracking, just you and your data.
                    </p>
                </div>

                {/* Trust/Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-20 border-y border-slate-200 dark:border-white/5 py-8 animate-fade-in delay-100">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">AES-256</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Encryption</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">P2P</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Direct Transfer</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Unlimited</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">File Size</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">0 Logs</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Privacy First</p>
                    </div>
                </div>

                {/* Action Blocks */}
                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto animate-slide-up delay-100">
                    {/* Send Block */}
                    <Link to="/send" className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 hover:border-primary-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary-400 transition-colors">Send Files</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">Create a secure room and share files of any size directly.</p>
                        </div>
                    </Link>

                    {/* Receive Block */}
                    <button onClick={() => setIsJoinModalOpen(true)} className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 hover:border-violet-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 overflow-hidden text-left">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-violet-400 transition-colors">Receive Files</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">Join a room with a code to start downloading securely.</p>
                        </div>
                    </button>
                </div>

                {/* How it Works Section */}
                <div className="mt-32 max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">How it Works</h2>
                        <p className="text-slate-600 dark:text-slate-400">Simple, secure, and fast. Just how it should be.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary-500/20 via-violet-500/20 to-primary-500/20"></div>

                        {/* Step 1 */}
                        <div className="relative text-center group">
                            <div className="w-24 h-24 mx-auto bg-white dark:bg-slate-900 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center mb-6 relative z-10 group-hover:border-primary-500 transition-colors duration-300 shadow-xl">
                                <span className="text-4xl">📁</span>
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold border-4 border-white dark:border-slate-950">1</div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Select File</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm px-4">Choose any file from your device. Encryption happens instantly in your browser.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative text-center group">
                            <div className="w-24 h-24 mx-auto bg-white dark:bg-slate-900 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center mb-6 relative z-10 group-hover:border-violet-500 transition-colors duration-300 shadow-xl">
                                <span className="text-4xl">🔗</span>
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center font-bold border-4 border-white dark:border-slate-950">2</div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Share Link</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm px-4">Send the unique room link or code to your recipient. No sign-up required.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative text-center group">
                            <div className="w-24 h-24 mx-auto bg-white dark:bg-slate-900 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center mb-6 relative z-10 group-hover:border-green-500 transition-colors duration-300 shadow-xl">
                                <span className="text-4xl">⚡</span>
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold border-4 border-white dark:border-slate-950">3</div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Transfer</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm px-4">Peer-to-peer connection is established. File flies directly to them.</p>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div id="features" className="mt-32 grid md:grid-cols-3 gap-6 animate-slide-up delay-200">
                    <FeatureCard
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}
                        title="End-to-End Encrypted"
                        description="Your files are encrypted in your browser before they ever leave your device. Only the receiver has the key."
                    />
                    <FeatureCard
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
                        title="Blazing Fast P2P"
                        description="Direct browser-to-browser transfer using WebRTC. No intermediate servers means maximum speed."
                    />
                    <FeatureCard
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />}
                        title="No File Limits"
                        description="Share files of any size or type. From documents to 4K videos, we handle it all with Turbo Mode."
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm mt-20">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Secure Era</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
                                The most secure way to share files on the web. Open source, peer-to-peer, and always free.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors">Features</a></li>
                                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors">Security</a></li>
                                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors">Roadmap</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center">
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <span className="sr-only">GitHub</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Join Room Modal */}
            {isJoinModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card w-full max-w-md animate-scale-in relative overflow-hidden">
                        {/* Modal Glow */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-violet-500"></div>

                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Join a Room</h3>
                            <button onClick={() => setIsJoinModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleJoinRoom}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Room Code</label>
                                <input
                                    type="text"
                                    value={joinRoomId}
                                    onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                                    placeholder="Enter 6-character code"
                                    className="input-field text-center text-2xl tracking-widest font-mono uppercase"
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!joinRoomId.trim()}
                                className="btn-primary w-full flex justify-center items-center space-x-2"
                            >
                                <span>Join Room</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="glass-card group hover:-translate-y-1">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition-colors duration-300">
                <svg className="w-6 h-6 text-slate-400 group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icon}
                </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
        </div>
    );
}

export default HomePage;
