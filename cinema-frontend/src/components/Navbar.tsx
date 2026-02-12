import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { API_CONFIG } from "../../config.ts";
import { useEffect, useState } from "react";
import logoImg from '../assets/logo.png';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleLogoClick = (e: React.MouseEvent) => {
        if (location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleScrollToNowPlaying = () => {
        if (location.pathname === '/') {
            const element = document.getElementById('now-playing');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            navigate('/#now-playing');
        }
    };

    const isHomePage = location.pathname === '/';
    const navBackground = isHomePage && !isScrolled
        ? 'bg-transparent border-transparent'
        : 'bg-[#1a1d26]/95 border-gray-800 shadow-2xl backdrop-blur-md';

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 px-8 flex justify-between items-center h-20 transition-all duration-500 ${navBackground} border-b font-sans`}>

            <div className="flex-shrink-0">
                <Link to="/" onClick={handleLogoClick} className="flex items-center group select-none">
                    <div className="relative w-12 h-12 md:w-14 md:h-14 transition-transform duration-300 group-hover:scale-110">
                        <img src={logoImg} alt="Cinema Logo" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(220,38,38,0.3)]" />
                        <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </Link>
            </div>

            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-10">

                <button
                    onClick={handleScrollToNowPlaying}
                    className="relative text-[13px] font-extrabold uppercase tracking-[0.2em] text-gray-300 hover:text-white transition-colors group overflow-hidden py-1"
                >
                    <span className="relative z-10">В прокаті</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                </button>

                <Link
                    to="/upcoming"
                    className="relative text-[13px] font-extrabold uppercase tracking-[0.2em] text-gray-300 hover:text-white transition-colors group overflow-hidden py-1"
                >
                    <span className="relative z-10">Скоро</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>


                {user?.role === 'Customer' && (
                    <Link
                        to="/bookings/my"
                        className="relative text-[13px] font-extrabold uppercase tracking-[0.2em] text-gray-300 hover:text-white transition-colors group overflow-hidden py-1"
                    >
                        <span className="relative z-10">Бронювання</span>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                )}
                <Link
                    to="/about"
                    className="relative text-[13px] font-extrabold uppercase tracking-[0.2em] text-gray-300 hover:text-white transition-colors group overflow-hidden py-1"
                >
                    <span className="relative z-10">Про нас</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
            </div>

            <div className="flex items-center gap-5 flex-shrink-0">
                {user ? (
                    <div className="flex items-center gap-4">
                        {(user.role === 'Admin' || user.role === 'Manager') && (
                            <Link to="/admin" className="hidden sm:flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                <ShieldCheck size={14} /> <span>Адмін</span>
                            </Link>
                        )}

                        <Link to="/profile" className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-full bg-black/20 hover:bg-black/40 border border-white/5 backdrop-blur-sm transition-all group">
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20">
                                {user.avatarUri ? (
                                    <img src={`${API_CONFIG.BASE_URL}${user.avatarUri}`} alt="Ava" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                        <UserIcon size={16} className="text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                                {user.firstName || user.name}
                            </span>
                        </Link>

                        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/40 active:scale-95"
                    >
                        Увійти
                    </Link>
                )}
            </div>

        </nav>
    );
};

export default Navbar;
