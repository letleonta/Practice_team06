import { Link, Routes, Route, useLocation } from 'react-router-dom';
import AdminMovies from './AdminMovies';
import AdminGenres from './AdminGenres';
import AdminDirectors from './AdminDirectors';
import AdminActors from './AdminActors';
import AdminSessions from './AdminSessions';
import {
    Film,
    Calendar,
    Users,
    Home,
    Tag,
    UserCheck,
    LayoutDashboard,
    Clapperboard,
    Settings
} from 'lucide-react';

const AdminDashboard = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navItemClass = (path: string) => `
        flex items-center gap-3 p-3 rounded-xl transition-all duration-200
        ${isActive(path)
        ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
    `;

    const getCurrentPageName = () => {
        const path = location.pathname.split('/').pop();
        const names: Record<string, string> = {
            'movies': 'Фільми',
            'genres': 'Жанри',
            'directors': 'Режисери',
            'actors': 'Актори',
            'sessions': 'Сеанси',
            'users': 'Користувачі'
        };
        return names[path || ''] || 'Панель керування';
    };

    return (
        <div className="flex min-h-screen bg-[#0f1117] text-white font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-[#1a1d26] border-r border-gray-800 p-6 flex flex-col shadow-2xl sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="bg-red-600 p-2 rounded-lg">
                        <Clapperboard size={24} className="text-white" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tighter italic">Cinema Admin</h2>
                </div>

                <nav className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                    {/* ГРУПА: КОНТЕНТ */}
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-2">Керування контентом</p>
                        <div className="space-y-1">
                            <Link to="/admin/movies" className={navItemClass('/admin/movies')}>
                                <Film size={20} /> <span className="font-medium">Фільми</span>
                            </Link>
                            <Link to="/admin/genres" className={navItemClass('/admin/genres')}>
                                <Tag size={20} /> <span className="font-medium">Жанри</span>
                            </Link>
                            <Link to="/admin/directors" className={navItemClass('/admin/directors')}>
                                <UserCheck size={20} /> <span className="font-medium">Режисери</span>
                            </Link>
                            <Link to="/admin/actors" className={navItemClass('/admin/actors')}>
                                <Users size={20} /> <span className="font-medium">Актори</span>
                            </Link>
                        </div>
                    </div>

                    {/* ГРУПА: РОЗКЛАД */}
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-2">Планування</p>
                        <div className="space-y-1">
                            <Link to="/admin/sessions" className={navItemClass('/admin/sessions')}>
                                <Calendar size={20} /> <span className="font-medium">Сеанси</span>
                            </Link>
                        </div>
                    </div>

                    {/* ГРУПА: СИСТЕМА */}
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-2">Система</p>
                        <div className="space-y-1">
                            <Link to="/admin/users" className={navItemClass('/admin/users')}>
                                <Users size={20} /> <span className="font-medium">Користувачі</span>
                            </Link>
                            {/* Можна додати Halls тут */}
                            <Link to="/admin/halls" className={navItemClass('/admin/halls')}>
                                <Settings size={20} /> <span className="font-medium">Зали</span>
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Bottom Actions */}
                <div className="pt-6 border-t border-gray-800">
                    <Link to="/" className="flex items-center gap-3 p-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all font-bold text-sm">
                        <Home size={18} /> На головну
                    </Link>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 bg-[#0f1117] overflow-y-auto">
                {/* Header */}
                <header className="h-20 border-b border-gray-800 flex items-center justify-between px-10 bg-[#0f1117]/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-2 text-gray-400">
                        <LayoutDashboard size={18} />
                        <span className="text-sm font-medium">Панель керування / {getCurrentPageName()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center font-bold shadow-lg shadow-red-600/30 cursor-default">
                            A
                        </div>
                    </div>
                </header>

                <div className="p-10">
                    <Routes>
                        <Route path="movies" element={<AdminMovies />} />
                        <Route path="genres" element={<AdminGenres />} />
                        <Route path="directors" element={<AdminDirectors />} />
                        <Route path="actors" element={<AdminActors />} />
                        <Route path="sessions" element={<AdminSessions />} /> {/* Тепер тут реальний компонент */}

                        {/* Заглушки */}
                        <Route path="users" element={
                            <div className="text-2xl font-bold p-10 bg-[#1a1d26] rounded-3xl border border-gray-800 text-center">
                                Розділ Користувачів у розробці
                            </div>
                        } />
                        <Route path="halls" element={
                            <div className="text-2xl font-bold p-10 bg-[#1a1d26] rounded-3xl border border-gray-800 text-center">
                                Керування Залами у розробці
                            </div>
                        } />

                        <Route path="*" element={
                            <div className="text-center py-20 flex flex-col items-center">
                                <Clapperboard size={80} className="text-gray-800 mb-6" />
                                <h2 className="text-3xl font-bold text-gray-600 tracking-tighter uppercase">Оберіть розділ меню</h2>
                                <p className="text-gray-500 mt-2">Використовуйте бічну панель для керування кінотеатром</p>
                            </div>
                        } />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;