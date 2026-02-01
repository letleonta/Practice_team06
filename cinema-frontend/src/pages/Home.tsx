import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import type { MovieDto } from '../types/movie';
import { Star, Clock, Ticket, ShieldCheck, LogOut, User as UserIcon, Search, Filter, CalendarDays } from 'lucide-react';

const Home = () => {
    const { user, logout, token } = useAuthStore();

    const [nowPlayingMovies, setNowPlayingMovies] = useState<MovieDto[]>([]);
    const [upcomingMovies, setUpcomingMovies] = useState<MovieDto[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'now' | 'soon'>('now');

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('Всі');

    useEffect(() => {
        Promise.all([
            api.get<MovieDto[]>('/movies/now-playing'),
            api.get<MovieDto[]>('/movies/upcoming')
        ])
            .then(([nowRes, upRes]) => {
                setNowPlayingMovies(nowRes.data);
                setUpcomingMovies(upRes.data);
            })
            .catch((err) => {
                console.error("Помилка завантаження фільмів:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Визначаємо, який список зараз показувати
    const currentList = activeTab === 'now' ? nowPlayingMovies : upcomingMovies;

    // Отримуємо список унікальних жанрів для ПОТОЧНОГО списку
    const uniqueGenres = useMemo(() => {
        if (!currentList.length) return ['Всі'];
        const allGenres = currentList.flatMap(movie => movie.genres || []);
        return ['Всі', ...Array.from(new Set(allGenres))];
    }, [currentList]);

    // Логіка фільтрації
    const filteredMovies = useMemo(() => {
        return currentList.filter(movie => {
            const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGenre = selectedGenre === 'Всі' || (movie.genres && movie.genres.includes(selectedGenre));
            return matchesSearch && matchesGenre;
        });
    }, [currentList, searchTerm, selectedGenre]);

    // Скидаємо жанр при перемиканні табів (щоб не застрягти на жанрі, якого немає в іншому списку)
    const handleTabChange = (tab: 'now' | 'soon') => {
        setActiveTab(tab);
        setSelectedGenre('Всі');
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
    };

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
                            {/* Кнопка Адміна */}
                            {token && (user.role === 'Admin' || user.role === 'Manager') && (
                                <Link
                                    to="/admin"
                                    className="hidden lg:flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/50 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-500/10"
                                >
                                    <ShieldCheck size={18} />
                                    <span>Адмін</span>
                                </Link>
                            )}

                            {/* НОВА КНОПКА: ПРОФІЛЬ */}
                            <Link
                                to="/profile"
                                className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-800 p-1 pr-4 rounded-full border border-gray-700 transition-all group"
                            >
                                <div className="bg-red-600 p-2 rounded-full group-hover:bg-red-500 transition-colors">
                                    <UserIcon size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-200 text-[10px] font-black uppercase tracking-widest leading-none">Мій кабінет</span>
                                    <span className="text-white text-xs font-bold truncate max-w-[100px]">{user.email}</span>
                                </div>
                            </Link>

                            {/* Кнопка Виходу */}
                            <button
                                onClick={logout}
                                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                title="Вийти"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-600/30 uppercase tracking-widest">
                            Увійти
                        </Link>
                    )}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 md:p-10">
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-1 w-12 bg-red-600 rounded-full"></div>
                        <span className="text-red-600 font-bold uppercase tracking-widest text-xs">Афіша кінотеатру</span>
                    </div>

                    {/* ГОЛОВНИЙ ПЕРЕМИКАЧ (ТАБИ) */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <div className="flex items-baseline gap-6 sm:gap-10 border-b border-gray-800 pb-1 w-full lg:w-auto">

                            {/* КНОПКА "ЗАРАЗ У КІНО" */}
                            <button
                                onClick={() => handleTabChange('now')}
                                className={`group text-3xl sm:text-5xl font-black italic tracking-tight transition-all pb-3 relative flex items-baseline gap-2 ${
                                    activeTab === 'now' ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                                }`}
                            >
                                <span>ЗАРАЗ У КІНО</span>
                                {/* Лічильник */}
                                <span className={`text-lg sm:text-2xl font-bold -translate-y-1 ${
                                    activeTab === 'now' ? 'text-gray-500' : 'text-gray-800 group-hover:text-gray-600'
                                }`}>
                {nowPlayingMovies.length}
            </span>

                                {activeTab === 'now' && <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 rounded-t-full shadow-[0_-2px_10px_rgba(220,38,38,0.5)]"></div>}
                            </button>

                            {/* КНОПКА "СКОРО" */}
                            <button
                                onClick={() => handleTabChange('soon')}
                                className={`group text-3xl sm:text-5xl font-black italic tracking-tight transition-all pb-3 relative flex items-baseline gap-2 ${
                                    activeTab === 'soon' ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                                }`}
                            >
                                <span>СКОРО</span>
                                {/* Лічильник */}
                                <span className={`text-lg sm:text-2xl font-bold -translate-y-1 ${
                                    activeTab === 'soon' ? 'text-gray-500' : 'text-gray-800 group-hover:text-gray-600'
                                }`}>
                {upcomingMovies.length}
            </span>

                                {activeTab === 'soon' && <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 rounded-t-full shadow-[0_-2px_10px_rgba(220,38,38,0.5)]"></div>}
                            </button>
                        </div>

                        {/* Фільтри */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            <div className="relative group flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Пошук..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#1a1d26] border border-gray-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-red-600 transition-all shadow-lg"
                                />
                            </div>
                            <div className="relative group">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors" size={18} />
                                <select
                                    value={selectedGenre}
                                    onChange={(e) => setSelectedGenre(e.target.value)}
                                    className="w-full bg-[#1a1d26] border border-gray-800 text-white rounded-xl pl-10 pr-8 py-2.5 focus:outline-none focus:border-red-600 transition-all appearance-none cursor-pointer shadow-lg"
                                >
                                    {uniqueGenres.map(genre => (
                                        <option key={genre} value={genre}>{genre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Жанри (теги) */}
                <div className="hidden md:flex flex-wrap gap-2 mb-10">
                    {uniqueGenres.map(genre => (
                        <button
                            key={genre}
                            onClick={() => setSelectedGenre(genre)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                                selectedGenre === genre
                                    ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20'
                                    : 'bg-[#1a1d26] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
                            }`}
                        >
                            {genre}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="h-16 w-16 rounded-full border-4 border-gray-800 border-t-red-600 animate-spin"></div>
                        <p className="text-gray-500 font-medium animate-pulse">Завантаження стрічок...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-12 gap-x-8">
                        {filteredMovies.map(movie => (
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
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-600 italic">No Poster</div>
                                    )}

                                    {/* Labels */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        <div className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black border border-white/10 w-fit">
                                            {movie.ageRestriction}
                                        </div>
                                    </div>

                                    {/* Відображаємо рейтинг тільки для фільмів, що вже вийшли */}
                                    {activeTab === 'now' && movie.rating && (
                                        <div className="absolute bottom-4 left-4 bg-yellow-500 text-black px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 shadow-lg">
                                            <Star size={12} fill="black" />
                                            {movie.rating.toFixed(1)}
                                        </div>
                                    )}

                                    {/* РІЗНІ КНОПКИ ДЛЯ "ЗАРАЗ" І "СКОРО" */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                        {activeTab === 'now' ? (
                                            <button className="w-full bg-white text-black font-black py-3 rounded-2xl flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-2xl hover:bg-gray-100">
                                                <Ticket size={18} />
                                                КУПИТИ КВИТОК
                                            </button>
                                        ) : (
                                            <div className="w-full bg-gray-900/80 backdrop-blur text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 border border-gray-700">
                                                <CalendarDays size={18} className="text-red-500" />
                                                <span>{formatDate(movie.releaseDate)}</span>
                                            </div>
                                        )}
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
                                        {/* Показуємо ціну тільки для активних фільмів */}
                                        {activeTab === 'now' && (
                                            <span className="text-gray-200 font-black text-sm">{movie.basePrice} ₴</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredMovies.length === 0 && (
                    <div className="text-center py-32 bg-gray-800/20 rounded-[40px] border-2 border-dashed border-gray-800/50">
                        <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            {activeTab === 'now' ? <Ticket size={32} className="text-gray-600" /> : <CalendarDays size={32} className="text-gray-600" />}
                        </div>
                        <h3 className="text-xl font-bold text-gray-400">
                            {activeTab === 'now' ? 'Зараз нічого не йде' : 'Скоро нічого не планується'}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">Спробуйте змінити параметри пошуку</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;