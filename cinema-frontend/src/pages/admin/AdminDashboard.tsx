import { Link, Routes, Route, useLocation } from 'react-router-dom';
import AdminMovies from './AdminMovies';
import AdminGenres from './AdminGenres';
import AdminDirectors from './AdminDirectors';
import AdminActors from './AdminActors';
import AdminSessions from './AdminSessions';
import AdminHalls from './AdminHalls';
import AdminLanguages from './AdminLanguages';
import AdminUsers from './AdminUsers';
import AdminBookings from './AdminBookings';
import { useAuthStore } from '../../store/useAuthStore';
import {
    Film,
    Calendar,
    Users,
    Home,
    Tag,
    UserCheck,
    LayoutGrid,
    Globe,
    Ticket,
    ChevronRight,
    Shield, UserIcon
} from 'lucide-react';
import {API_CONFIG} from "../../../config.ts";

const AdminDashboard = () => {
    const location = useLocation();
    const { user } = useAuthStore();
    // Захист від null (якщо юзер ще вантажиться)
    const userRole = user?.role || 'Guest';

    // Перевірка активного посилання (includes дозволяє підсвічувати батьківський розділ)
    const isActive = (path: string) => location.pathname.includes(path);

    const navItemClass = (path: string) => `
        flex items-center justify-between p-3 rounded-xl transition-all duration-200 group cursor-pointer
        ${isActive(path)
        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
    `;

    return (
        <div className="flex min-h-screen bg-[#0f1117] text-white font-sans">
            {/* --- MAIN CONTENT AREA --- */}
            <aside className="w-72 bg-[#1a1d26] border-r border-gray-800 p-6 flex flex-col shadow-2xl z-20 sticky top-0 h-screen">
                <div className="mb-10">
                    <div className="flex items-center gap-4 bg-[#0f1117]/50 hover:bg-[#0f1117] p-1.5 pr-6 rounded-full border border-gray-800 transition-all group shadow-2xl shadow-black/20">
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-900 flex items-center justify-center border-2 border-red-600 shadow-lg shadow-red-600/10 shrink-0">
                            {user?.avatarUri ? (
                                <img
                                    src={`${API_CONFIG.BASE_URL}${user.avatarUri}`}
                                    alt="Ava"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <UserIcon size={20} className="text-gray-500" />
                            )}
                        </div>

                        <div className="flex flex-col text-left min-w-0">
                            <span className="text-white text-[13px] font-black uppercase tracking-wider leading-none mb-1.5 truncate">
                                {user?.firstName || "Адмін"}
                            </span>
                            <span className="text-red-500 text-[9px] font-black uppercase tracking-[0.15em] leading-none">
                                {userRole}
                            </span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2">
                    {/* ГРУПА: КОНТЕНТ */}
                    <div>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 px-2">Контент</p>
                        <div className="space-y-1">
                            <Link to="/admin/movies" className={navItemClass('/admin/movies')}>
                                <div className="flex items-center gap-3"><Film size={18} /> <span>Фільми</span></div>
                                <ChevronRight size={14} className={isActive('/admin/movies') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                            </Link>
                            <Link to="/admin/genres" className={navItemClass('/admin/genres')}>
                                <div className="flex items-center gap-3"><Tag size={18} /> <span>Жанри</span></div>
                                <ChevronRight size={14} className={isActive('/admin/genres') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                            </Link>
                            <Link to="/admin/languages" className={navItemClass('/admin/languages')}>
                                <div className="flex items-center gap-3"><Globe size={18} /> <span>Мови</span></div>
                                <ChevronRight size={14} className={isActive('/admin/languages') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                            </Link>
                            <Link to="/admin/directors" className={navItemClass('/admin/directors')}>
                                <div className="flex items-center gap-3"><UserCheck size={18} /> <span>Режисери</span></div>
                                <ChevronRight size={14} className={isActive('/admin/directors') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                            </Link>
                            <Link to="/admin/actors" className={navItemClass('/admin/actors')}>
                                <div className="flex items-center gap-3"><Users size={18} /> <span>Актори</span></div>
                                <ChevronRight size={14} className={isActive('/admin/actors') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                            </Link>
                        </div>
                    </div>

                    {/* ГРУПА: ЗАЛИ ТА ПРОДАЖІ */}
                    <div>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 px-2">Кінотеатр</p>
                        <div className="space-y-1">
                            <Link to="/admin/sessions" className={navItemClass('/admin/sessions')}>
                                <div className="flex items-center gap-3"><Calendar size={18} /> <span>Сеанси</span></div>
                                <ChevronRight size={14} className={isActive('/admin/sessions') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                            </Link>
                            <Link to="/admin/halls" className={navItemClass('/admin/halls')}>
                                <div className="flex items-center gap-3"><LayoutGrid size={18} /> <span>Зали</span></div>
                                <ChevronRight size={14} className={isActive('/admin/halls') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                            </Link>
                            <Link to="/admin/bookings" className={navItemClass('/admin/bookings')}>
                                <div className="flex items-center gap-3"><Ticket size={18} /> <span>Бронювання</span></div>
                                <ChevronRight size={14} className={isActive('/admin/bookings') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                            </Link>
                        </div>
                    </div>

                    {(userRole === 'Admin' || userRole === 'Manager') && (
                        <div>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 px-2">Система</p>
                            <div className="space-y-1">
                                <Link to="/admin/users" className={navItemClass('/admin/users')}>
                                    <div className="flex items-center gap-3"><Users size={18} /> <span>Користувачі</span></div>
                                    <ChevronRight size={14} className={isActive('/admin/users') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                                </Link>
                            </div>
                        </div>
                    )}
                </nav>

                <div className="pt-6 border-t border-gray-800">
                    <Link to="/" className="flex items-center gap-3 p-4 rounded-2xl bg-gray-800/50 text-gray-300 hover:bg-red-600 hover:text-white transition-all font-bold text-sm shadow-inner">
                        <Home size={18} /> На сайт
                    </Link>
                </div>
            </aside>
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-10 bg-[#0b0d12] custom-scrollbar">
                    <Routes>
                        <Route path="/" element={
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-fade-in">
                                <div className="bg-red-600/10 p-6 rounded-full border border-red-600/10">
                                    <Shield size={64} className="text-red-600 opacity-20" />
                                </div>
                                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-gray-700">Вітаємо, {userRole}</h2>
                                <p className="text-gray-500 max-w-sm font-medium">
                                    Система готова до роботи. Оберіть розділ у меню зліва.
                                </p>
                            </div>
                        } />

                        <Route path="movies" element={<AdminMovies />} />
                        <Route path="genres" element={<AdminGenres />} />
                        <Route path="directors" element={<AdminDirectors />} />
                        <Route path="actors" element={<AdminActors />} />
                        <Route path="sessions" element={<AdminSessions />} />
                        <Route path="halls" element={<AdminHalls />} />
                        <Route path="languages" element={<AdminLanguages />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="bookings" element={<AdminBookings />} />

                        <Route path="*" element={
                            <div className="text-center py-20">
                                <h2 className="text-3xl font-bold text-gray-600 tracking-tighter uppercase italic">Сторінку не знайдено</h2>
                            </div>
                        } />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;