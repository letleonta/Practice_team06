import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const BASE_URL = "http://localhost:5144";

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="sticky top-0 z-50 px-8 bg-[#1a1d26]/95 backdrop-blur-md flex justify-between items-center border-b border-gray-800 shadow-2xl h-16 font-sans">

            {/* ЛІВА ЧАСТИНА: Логотип */}
            <div className="flex items-center gap-12">
                <Link to="/" className="group">
                    <h1 className="text-2xl font-black text-red-600 tracking-tighter transition-transform group-hover:scale-105">
                        CINEMA
                    </h1>
                </Link>

                {/* Навігація зі зміненим шрифтом */}
                <div className="hidden md:flex gap-8">
                    <Link to="/movies" className="text-[14px] font-extrabold uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors">
                        В прокаті
                    </Link>
                    <Link to="/movies" className="text-[14px] font-extrabold uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors">
                        Скоро в кіно
                    </Link>
                    {user && (user.role === 'Customer' || user.role === 'Admin') && (
                        <Link to="/bookings/my" className="text-[14px] font-extrabold uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors">
                            Бронювання
                        </Link>
                    )}
                </div>
            </div>

            {/* ПРАВА ЧАСТИНА: Профіль та вихід */}
            <div className="flex items-center gap-5">
                {user ? (
                    <div className="flex items-center gap-4">

                        {/* Кнопка Адміна */}
                        {(user.role === 'Admin' || user.role === 'Manager') && (
                            <Link
                                to="/admin"
                                className="hidden sm:flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all"
                            >
                                <ShieldCheck size={16} />
                                <span>Адмін</span>
                            </Link>
                        )}

                        {/* КНОПКА ПРОФІЛЮ */}
                        <Link
                            to="/profile"
                            className="flex items-center gap-4 bg-[#0f1117]/50 hover:bg-[#0f1117] p-1.5 pr-6 rounded-full border border-gray-800 transition-all group"
                        >
                            {/* Аватарка w-11 h-11 з червоним бордером */}
                            <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-900 flex items-center justify-center border-2 border-red-600 shadow-lg shadow-red-600/10">
                                {user.avatarUrl ? (
                                    <img
                                        src={`${BASE_URL}${user.avatarUrl}`}
                                        alt="Ava"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <UserIcon size={20} className="text-gray-500" />
                                )}
                            </div>

                            {/* Текст профілю */}
                            <div className="flex flex-col text-left">
                                <span className="text-white text-[13px] font-black uppercase tracking-wider leading-none mb-1">
                                    {user.firstName || user.name}
                                </span>
                                <span className="text-red-500 text-[9px] font-black uppercase tracking-[0.15em] leading-none">
                                    Мій кабінет
                                </span>
                            </div>
                        </Link>

                        {/* Вихід */}
                        <button
                            onClick={handleLogout}
                            className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                        >
                            <LogOut size={22} />
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="bg-red-600 hover:bg-red-700 text-white px-10 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] transition-all shadow-xl shadow-red-600/20 active:scale-95"
                    >
                        Увійти
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;