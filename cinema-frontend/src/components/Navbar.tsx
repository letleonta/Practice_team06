import {Link, useNavigate} from 'react-router-dom';
import {LogOut, ShieldCheck, User as UserIcon} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="sticky top-0 z-50 p-4 bg-[#1a1d26]/90 backdrop-blur-md flex justify-between items-center border-b border-gray-800 shadow-2xl">
            <div className="flex items-center gap-8">
                <h1 className="text-2xl font-black text-red-600 tracking-tighter">
                    <Link to="/">CINEMA</Link>
                </h1>

                <div className="flex gap-6 text-sm font-medium text-gray-400">
                    <Link to="/" className="hover:text-white transition">Головна</Link>
                    <Link to="/movies" className="hover:text-white transition">Фільми</Link>
                    {user && user.role === 'Customer' && (
                        <Link to="/bookings/my" className="hover:text-white transition">
                            Мої бронювання
                        </Link>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-3">
                        {/* Кнопка Адміна - з'являється тільки якщо роль Admin */}
                        {user.role === 'Admin' && (
                            <Link
                                to="/admin"
                                className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/50 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-500/10"
                            >
                                <ShieldCheck size={18} />
                                <span>Панель адміна</span>
                            </Link>
                        )}

                        <Link
                            to="/profile"
                            className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-800 p-1 pr-4 rounded-full border border-gray-700 transition-all group"
                        >
                            <div className="bg-red-600 p-2 rounded-full group-hover:bg-red-500 transition-colors">
                                <UserIcon size={16} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-200 text-[10px] font-black uppercase tracking-widest leading-none">Мій кабінет</span>
                                <span className="text-white text-xs font-bold truncate max-w-[100px]">{user.name}</span>
                            </div>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Вийти"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-600/30">
                        Увійти
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
