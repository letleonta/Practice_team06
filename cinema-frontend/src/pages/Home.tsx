import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import type { Movie } from '../types/movie';
import { Star, Clock, Ticket, ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';

const Home = () => {
    const { user, logout } = useAuthStore();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<Movie[]>('/movies')
            .then(res => {
                setMovies(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Помилка завантаження фільмів:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-[#0f1117] text-white font-sans">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 p-4 bg-[#1a1d26]/90 backdrop-blur-md flex justify-between items-center border-b border-gray-800 shadow-2xl">
                <div className="flex items-center gap-8">
                    <h1 className="text-2xl font-black text-red-600 tracking-tighter cursor-pointer">CINEMA</h1>
                    <div className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
                        <Link to="/" className="hover:text-white transition">Афіша</Link>
                        <Link to="/" className="hover:text-white transition">Кінотеатри</Link>
                        <Link to="/" className="hover:text-white transition">Акції</Link>
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

                            <div className="flex items-center gap-3 bg-gray-800/50 p-1 pr-4 rounded-full border border-gray-700">
                                <div className="bg-red-600 p-2 rounded-full">
                                    <UserIcon size={16} />
                                </div>
                                <span className="text-gray-200 text-sm font-medium hidden sm:inline">{user.email}</span>
                            </div>

                            <button
                                onClick={logout}
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

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-6 md:p-10">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-1 w-12 bg-red-600 rounded-full"></div>
                        <span className="text-red-600 font-bold uppercase tracking-widest text-xs">На великих екранах</span>
                    </div>
                    <h2 className="text-5xl font-black italic tracking-tight">ЗАРАЗ У КІНО</h2>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full border-4 border-gray-800"></div>
                            <div className="absolute top-0 h-16 w-16 rounded-full border-4 border-t-red-600 animate-spin"></div>
                        </div>
                        <p className="text-gray-500 font-medium animate-pulse">Завантаження стрічок...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-12 gap-x-8">
                        {movies.map(movie => (
                            <div key={movie.id} className="group cursor-pointer">
                                {/* Poster Image */}
                                <div className="relative aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-gray-800 group-hover:border-red-600/50 transition-all duration-500">
                                    {movie.posterUri ? (
                                        <img
                                            src={movie.posterUri}
                                            alt={movie.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-600 italic">
                                            No Poster
                                        </div>
                                    )}

                                    {/* Overlay Labels */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        <div className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black border border-white/10 w-fit">
                                            {movie.ageRestriction}
                                        </div>
                                    </div>

                                    {movie.rating && (
                                        <div className="absolute bottom-4 left-4 bg-yellow-500 text-black px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 shadow-lg shadow-yellow-500/20">
                                            <Star size={12} fill="black" />
                                            {movie.rating.toFixed(1)}
                                        </div>
                                    )}

                                    {/* Quick Buy Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                        <button className="w-full bg-white text-black font-black py-3 rounded-2xl flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-2xl">
                                            <Ticket size={18} />
                                            КУПИТИ КВИТОК
                                        </button>
                                    </div>
                                </div>

                                {/* Movie Labels */}
                                <div className="mt-5 space-y-2">
                                    <h3 className="font-bold text-xl leading-tight group-hover:text-red-500 transition-colors duration-300 truncate">
                                        {movie.title}
                                    </h3>

                                    <div className="flex gap-2 text-[10px] text-gray-500 font-bold uppercase">
                                        {movie.genres.slice(0, 2).map(g => (
                                            <span key={g} className="bg-gray-800/50 px-2 py-0.5 rounded border border-gray-700/50">{g}</span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                                            <Clock size={14} className="text-red-600" />
                                            <span>{movie.durationMin} хв</span>
                                        </div>
                                        <span className="text-gray-200 font-black text-sm">{movie.basePrice} ₴</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && movies.length === 0 && (
                    <div className="text-center py-32 bg-gray-800/20 rounded-[40px] border-2 border-dashed border-gray-800/50">
                        <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Ticket size={32} className="text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400">Наразі немає активних фільмів</h3>
                        <p className="text-gray-600 text-sm mt-1">Адміністрація працює над оновленням афіші</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;