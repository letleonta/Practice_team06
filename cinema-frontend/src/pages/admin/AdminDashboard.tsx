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
    LayoutDashboard,
    Clapperboard,
    LayoutGrid,
    Globe,
    Ticket,
    ChevronRight,
    Shield
} from 'lucide-react';

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
            {/* --- SIDEBAR --- */}
            <aside className="w-72 bg-[#1a1d26] border-r border-gray-800 p-6 flex flex-col shadow-2xl z-20 sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="bg-red-600 p-2 rounded-lg shadow-lg shadow-red-600/20">
                        <Clapperboard size={24} className="text-white" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tighter">Cinema Admin</h2>
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
                            </Link>
                            <Link to="/admin/languages" className={navItemClass('/admin/languages')}>
                                <div className="flex items-center gap-3"><Globe size={18} /> <span>Мови</span></div>
                            </Link>
                            <Link to="/admin/directors" className={navItemClass('/admin/directors')}>
                                <div className="flex items-center gap-3"><UserCheck size={18} /> <span>Режисери</span></div>
                            </Link>
                            <Link to="/admin/actors" className={navItemClass('/admin/actors')}>
                                <div className="flex items-center gap-3"><Users size={18} /> <span>Актори</span></div>
                            </Link>
                        </div>
                    </div>

                    {/* ГРУПА: ЗАЛИ ТА ПРОДАЖІ */}
                    <div>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 px-2">Кінотеатр</p>
                        <div className="space-y-1">
                            <Link to="/admin/sessions" className={navItemClass('/admin/sessions')}>
                                <div className="flex items-center gap-3"><Calendar size={18} /> <span>Сеанси</span></div>
                            </Link>
                            <Link to="/admin/halls" className={navItemClass('/admin/halls')}>
                                <div className="flex items-center gap-3"><LayoutGrid size={18} /> <span>Зали</span></div>
                            </Link>
                            <Link to="/admin/bookings" className={navItemClass('/admin/bookings')}>
                                <div className="flex items-center gap-3"><Ticket size={18} /> <span>Бронювання</span></div>
                            </Link>
                        </div>
                    </div>

                    {/* ГРУПА: СИСТЕМА (Доступна і Адміну, і Менеджеру) */}
                    {(userRole === 'Admin' || userRole === 'Manager') && (
                        <div>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 px-2">Система</p>
                            <div className="space-y-1">
                                <Link to="/admin/users" className={navItemClass('/admin/users')}>
                                    <div className="flex items-center gap-3"><Users size={18} /> <span>Користувачі</span></div>
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

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-gray-800 flex items-center justify-between px-10 bg-[#0f1117]/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-3 text-gray-400">
                        <LayoutDashboard size={20} className="text-red-600" />
                        <span className="text-sm font-bold uppercase tracking-widest text-gray-500">
                            {location.pathname === '/admin' ? 'DASHBOARD' : location.pathname.split('/').pop()?.toUpperCase()}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end mr-2">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${userRole === 'Admin' ? 'text-red-500 border-red-500/30 bg-red-500/10' : 'text-amber-500 border-amber-500/30 bg-amber-500/10'}`}>
                                {userRole}
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">System Access</span>
                        </div>
                        {/* Безпечний рендер першої літери */}
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border ${userRole === 'Admin' ? 'bg-linear-to-br from-red-600 to-red-900 border-red-500/20' : 'bg-linear-to-br from-amber-500 to-amber-700 border-amber-500/20'}`}>
                            {(userRole || 'G').charAt(0)}
                        </div>
                    </div>
                </header>

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