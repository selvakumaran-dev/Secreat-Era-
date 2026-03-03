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
                    <div className="w-8 h-8 rounded-lg bg-primary-600 dark:bg-primary-500 flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Secure Era</span>
                </div>
                <div className="flex items-center space-x-6">
                    <ThemeToggle />
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
                <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-6 shadow-sm backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                        v2.0 Now Available with Turbo Mode
                    </div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-slate-900 dark:text-white leading-tight tracking-tight">
                        Share files securely, <br />
                        <span className="text-primary-600 dark:text-primary-400">without limits.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium">
                        Peer-to-peer, end-to-end encrypted file sharing. <br className="hidden md:block" />
                        No servers, no tracking, just you and your data.
                    </p>
                </div>


                {/* Action Blocks */}
                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto animate-slide-up delay-100">
                    {/* Send Block */}
                    <Link to="/send" className="group relative p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 hover:border-primary-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-500/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Send Files</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">Create a secure room and share files of any size directly.</p>
                        </div>
                    </Link>

                    {/* Receive Block */}
                    <button onClick={() => setIsJoinModalOpen(true)} className="group relative p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 hover:border-violet-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1 overflow-hidden text-left">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-500/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-7 h-7 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Receive Files</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">Join a room with a code to start downloading securely.</p>
                        </div>
                    </button>
                </div>


            </main>



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

export default HomePage;
