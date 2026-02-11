import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MovieService } from '../services/movie.service';
import type { MovieDto } from '../types/movie';
import { Play, Info, ChevronRight, Star, Clock, ChevronLeft } from 'lucide-react';
import { AgeRestrictionBadge } from "../components/AgeRestrictionBadge";
import { formatDateWithYear } from "../utils/formatTime";
import { Button } from "../components/ui/Button";

const HomePage = () => {
    const navigate = useNavigate();

    // Стан даних
    const [heroMovies, setHeroMovies] = useState<MovieDto[]>([]); // Фільми для слайдера
    const [nowPlaying, setNowPlaying] = useState<MovieDto[]>([]); // Стрічка "Зараз у кіно"
    const [topRated, setTopRated] = useState<MovieDto[]>([]);     // Стрічка "Топ рейтинг"
    const [loading, setLoading] = useState(true);

    // Стан слайдера
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Завантажуємо дані паралельно для швидкості
                const [nowPlayingRes, topRatedRes] = await Promise.all([
                    MovieService.getAll({ Page: 1, PageSize: 10 }), // Останні фільми
                    MovieService.getAll({ Page: 1, PageSize: 10, rating: 8.0 }) // Фільми з високим рейтингом
                ]);

                setNowPlaying(nowPlayingRes.items || []);
                setTopRated(topRatedRes.items || []);

                // Для Hero-слайдера беремо 5 найкращих фільмів
                // (або з топу, або з новинок, залежно від того, що пріоритетніше)
                const heroes = topRatedRes.items?.slice(0, 5) || [];
                setHeroMovies(heroes);

            } catch (error) {
                console.error("Помилка завантаження фільмів:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Автоматичне перемикання слайдів кожні 8 секунд
    useEffect(() => {
        if (heroMovies.length === 0) return;
        const timer = setInterval(() => {
            setCurrentSlide(curr => (curr + 1) % heroMovies.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [heroMovies]);

    if (loading) return (
        <div className="h-screen bg-[#0f1117] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const activeHero = heroMovies[currentSlide];

    return (
        <div className="min-h-screen bg-[#0f1117] text-white font-sans pb-20 overflow-x-hidden selection:bg-red-500/30">

            {/* --- 1. HERO SECTION (Слайдер на весь екран) --- */}
            <header className="relative h-screen w-full overflow-hidden group">
                {activeHero && (
                    <>
                        {/* ФОН (Постер як бекграунд) */}
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            <img
                                key={activeHero.id} // key змушує React перезапускати анімацію scaleIn
                                src={activeHero.posterUri}
                                alt={activeHero.title}
                                className="w-full h-full object-cover animate-[scaleIn_20s_infinite_alternate] opacity-60 md:opacity-70 blur-sm md:blur-0"
                                style={{ objectPosition: 'center 20%' }}
                            />
                            {/* Градієнти для читабельності тексту */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0f1117] via-[#0f1117]/60 to-transparent z-10" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-[#0f1117]/20 to-transparent z-10" />
                            <div className="absolute inset-0 bg-black/20 z-10" />
                        </div>

                        {/* КОНТЕНТ СЛАЙДЕРА */}
                        <div className="relative z-20 h-full flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto pt-20">
                            <div className="max-w-3xl space-y-6 animate-fade-in-up">

                                {/* Верхні теги (Рік, Жанр, Вік) */}
                                <div className="flex items-center gap-4 text-xs md:text-sm font-bold tracking-widest uppercase text-gray-300">
                                    <AgeRestrictionBadge restriction={activeHero.ageRestriction} />
                                    {activeHero.genres?.[0] && (
                                        <>
                                            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                                            <span>{activeHero.genres[0].name}</span>
                                        </>
                                    )}
                                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                                    <span>{formatDateWithYear(activeHero.releaseDate)}</span>
                                </div>

                                {/* Заголовок */}
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white drop-shadow-2xl leading-[0.9]">
                                    {activeHero.title}
                                </h1>

                                {/* Рейтинг та Тривалість */}
                                <div className="flex items-center gap-6 text-lg">
                                    {activeHero.rating && (
                                        <div className="flex items-center gap-2 text-yellow-400 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                                            <Star fill="currentColor" size={18} />
                                            <span className="font-bold">{activeHero.rating.toFixed(1)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-gray-300 font-medium">
                                        <Clock size={20} className="text-red-500"/>
                                        <span>{activeHero.durationMin} хв</span>
                                    </div>
                                </div>

                                {/* Опис */}
                                <p className="text-gray-300 text-lg md:text-xl line-clamp-3 font-light leading-relaxed max-w-2xl drop-shadow-md">
                                    {activeHero.description}
                                </p>

                                {/* Кнопки */}
                                <div className="flex flex-wrap gap-4 pt-6">
                                    <Button variant="primary" onClick={() => navigate(`/movie/${activeHero.id}`)} icon={<Play fill="currentColor" size={18} />}>
                                        Дивитись трейлер
                                    </Button>
                                    <Button variant="glass" onClick={() => navigate(`/movie/${activeHero.id}`)} icon={<Info size={20} />}>
                                        Детальніше
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Індикатори слайдів (крапки) */}
                        <div className="absolute bottom-10 right-10 z-30 flex gap-3">
                            {heroMovies.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-12 bg-red-600' : 'w-2 bg-white/20 hover:bg-white/50'}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </header>

            {/* --- 2. СЕКЦІЇ (Горизонтальні списки) --- */}
            {/* Піднімаємо контент трохи на банер (-mt-24) для ефекту глибини */}
            <div className="relative z-20 -mt-24 space-y-12 px-4 md:px-12 pb-20 bg-gradient-to-t from-[#0f1117] via-[#0f1117] to-transparent pt-24">

                <MovieRow title="Зараз у кіно" movies={nowPlaying} />

                {topRated.length > 0 && (
                    <MovieRow title="Топ рейтинг" movies={topRated} />
                )}
            </div>
        </div>
    );
};

// --- ДОПОМІЖНИЙ КОМПОНЕНТ РЯДКА (Horizontal Scroll) ---
const MovieRow = ({ title, movies }: { title: string, movies: MovieDto[] }) => {
    const rowRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (rowRef.current) {
            const { clientWidth } = rowRef.current;
            const offset = direction === 'left' ? -clientWidth * 0.7 : clientWidth * 0.7;
            rowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

    if (!movies || movies.length === 0) return null;

    return (
        <section className="group/section relative">
            {/* Заголовок секції */}
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3 tracking-tight">
                    <span className="w-1.5 h-8 bg-gradient-to-b from-red-600 to-orange-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]"></span>
                    {title}
                </h2>
                <Link to="/" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1">
                    Всі <ChevronRight size={14} />
                </Link>
            </div>

            {/* Контейнер слайдера */}
            <div className="relative">
                {/* Кнопка Вліво */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-black/50 hover:bg-red-600 text-white rounded-full backdrop-blur-md flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-all -translate-x-1/2 shadow-xl border border-white/10"
                >
                    <ChevronLeft size={24} />
                </button>

                {/* Список карток */}
                <div
                    ref={rowRef}
                    className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-8 px-2 pt-2 snap-x"
                >
                    {movies.map((movie) => (
                        <Link
                            to={`/movie/${movie.id}`}
                            key={movie.id}
                            className="block relative flex-shrink-0 w-[180px] md:w-[240px] snap-start group/card transition-transform duration-300 hover:scale-105 hover:z-30 perspective-1000"
                        >
                            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#1a1d26] border border-white/5 shadow-lg group-hover/card:shadow-[0_0_30px_rgba(220,38,38,0.4)] group-hover/card:border-red-500/30 transition-all">
                                {movie.posterUri ? (
                                    <img src={movie.posterUri} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold">No Poster</div>
                                )}

                                {/* Оверлей при наведенні */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                    <div className="translate-y-4 group-hover/card:translate-y-0 transition-transform duration-300">
                                        <button className="w-full py-2.5 bg-red-600 text-white font-bold rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 hover:bg-red-700">
                                            <Play size={14} fill="currentColor"/> Квитки
                                        </button>
                                    </div>
                                </div>

                                {/* Бейджі */}
                                <div className="absolute top-2 left-2">
                                    <AgeRestrictionBadge restriction={movie.ageRestriction} />
                                </div>
                                {movie.rating && (
                                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[10px] font-bold text-yellow-400 flex items-center gap-1 border border-white/10">
                                        <Star size={8} fill="currentColor" /> {movie.rating.toFixed(1)}
                                    </div>
                                )}
                            </div>

                            <h3 className="mt-3 font-bold text-white truncate text-base group-hover/card:text-red-500 transition-colors">{movie.title}</h3>
                            <p className="text-xs text-gray-500 truncate">{movie.genres?.map(g => g.name).join(', ')}</p>
                        </Link>
                    ))}
                </div>

                {/* Кнопка Вправо */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-black/50 hover:bg-red-600 text-white rounded-full backdrop-blur-md flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-all translate-x-1/2 shadow-xl border border-white/10"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </section>
    );
};

export default HomePage;