import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MovieService } from '../services/movie.service';
import { SessionService } from '../services/session.service';
import type { MovieDto } from '../types/movie';
import type { SessionFilterDto } from '../types/session';
import { ChevronLeft, ChevronRight, Clock, Calendar, Star, Ticket, ArrowLeft, User, Loader2, PlayCircle } from 'lucide-react';
import { formatDateWithYear } from "../utils/formatTime.ts";
import { AgeRestrictionBadge } from "../components/AgeRestrictionBadge.tsx";
import { SessionItem } from "../components/SessionItem.tsx";
import { Pagination } from "../components/Pagination";
import { UsePagination } from "../hooks/UsePagination";

const MoviePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [movie, setMovie] = useState<MovieDto | null>(null);
    const [loadingMovie, setLoadingMovie] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Панель дат
    const dateTabs = useMemo(() => {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            dates.push(d);
        }
        return dates;
    }, []);

    const [selectedDate, setSelectedDate] = useState<Date>(dateTabs[0]);

    // 2. Логіка завантаження СЕАНСІВ
    const fetchSessions = async (Page: number, PageSize: number) => {
        const start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);

        const filter: SessionFilterDto = {
            dateFrom: start.toISOString(),
            dateTo: end.toISOString(),
            Page,
            PageSize
        };

        return await SessionService.getByMovieId(Number(id), filter);
    };

    const {
        items: sessions,
        currentPage,
        totalPages,
        loading: loadingSessions,
        goToPage
    } = UsePagination(fetchSessions, [id, selectedDate], { pageSize: 12 });

    // 3. Завантаження даних про фільм
    useEffect(() => {
        if (!id) return;
        MovieService.getById(Number(id))
            .then(setMovie)
            .catch(console.error)
            .finally(() => setLoadingMovie(false));
    }, [id]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const handleBuyTicket = (sessionId: number) => navigate(`/sessions/${sessionId}`);

    const getYouTubeId = (url?: string) => {
        if (!url) return null;
        const regExp = /^.*(?:youtu.be\/|v\/|e\/|u\/\w\/|embed\/|v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[1].length === 11) ? match[1] : null;
    };

    const trailerId = getYouTubeId(movie?.trailerUri);

    if (loadingMovie && !movie) return (
        <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
            <Loader2 className="w-16 h-16 text-red-600 animate-spin" />
        </div>
    );

    if (!movie) return <div className="text-white text-center py-20">Фільм не знайдено</div>;

    return (
        <div className="min-h-screen bg-[#0f1117] text-white font-sans overflow-x-hidden">
            {/* Трейлер на фоні */}
            <div className="relative h-[85vh] w-full bg-black overflow-hidden group">
                {trailerId ? (
                    <div className="absolute inset-0 w-full h-full scale-[1.35]">
                        <iframe
                            className="w-full h-full opacity-60 pointer-events-none"
                            src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerId}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
                            title="Trailer"
                            allow="autoplay; encrypted-media"
                            style={{ border: 'none' }}
                        />
                    </div>
                ) : (
                    <img src={movie.posterUri} alt="" className="w-full h-full object-cover opacity-40 blur-sm" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1d26]/40 via-transparent to-[#0f1117] z-10"></div>
                <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#0f1117] via-[#0f1117]/90 to-transparent z-10"></div>
                <button onClick={() => navigate(-1)} className="absolute top-24 left-6 z-40 bg-black/60 hover:bg-red-600 p-3 rounded-full backdrop-blur-md transition-all text-white border border-white/10 group">
                    <ArrowLeft size={24} />
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-96 relative z-20 pb-20">
                <div className="flex flex-col md:flex-row gap-10 items-start mb-16">

                    {/* ПОСТЕР */}
                    <div className="w-64 sm:w-80 md:w-1/3 lg:w-1/4 shrink-0 mx-auto md:mx-0 shadow-2xl rounded-2xl overflow-hidden border-4 border-[#1a1d26] bg-[#1a1d26] relative group z-30">
                        {movie.trailerUri ? (
                            <a href={movie.trailerUri} target="_blank" rel="noopener noreferrer" className="block relative group cursor-pointer">
                                <img src={movie.posterUri || 'no-poster.jpg'} alt={movie.title} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                    <PlayCircle size={48} className="text-red-600" />
                                    <span className="text-white font-black text-xs uppercase tracking-widest">Дивитись трейлер</span>
                                </div>
                            </a>
                        ) : (
                            <img src={movie.posterUri || 'no-poster.jpg'} alt={movie.title} className="w-full h-auto object-cover" />
                        )}
                    </div>

                    {/* ІНФО ТА ОПИС  */}
                    <div className="flex-1 w-full pt-2">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <AgeRestrictionBadge restriction={movie.ageRestriction} />
                            {movie.genres?.map(g => (
                                <span key={g.id} className="bg-white/10 border border-white/20 px-3 py-1 rounded text-xs font-bold text-white uppercase tracking-wide">{g.name}</span>
                            ))}
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-white drop-shadow-2xl">{movie.title}</h1>

                        <div className="flex flex-wrap items-center gap-6 text-gray-200 mb-8 font-medium text-base">
                            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10"><Clock className="text-red-500" size={20} /> <span>{movie.durationMin} хв</span></div>
                            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10"><Calendar className="text-red-500" size={20} /> <span>{formatDateWithYear(movie.releaseDate)}</span></div>
                            {movie.rating && (<div className="flex items-center gap-2 text-yellow-400 bg-black/40 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10"><Star fill="currentColor" size={20} /> <span className="text-white font-bold text-lg">{movie.rating.toFixed(1)}</span></div>)}
                        </div>
                        {/* Про фільм */}
                        <div className="space-y-4 bg-black/20 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
                            <h3 className="text-white font-bold text-xl uppercase tracking-widest opacity-50 flex items-center gap-4">
                                Про фільм
                                <div className="h-px bg-white/10 flex-1"></div>
                            </h3>
                            <p className="text-gray-300 leading-relaxed text-xl font-medium">
                                "{movie.description || "Опис відсутній."}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* СЛАЙДЕР КОМАНДИ (НИЖЧЕ) */}
                <section className="mb-20">
                    <div className="flex justify-between items-end mb-8">
                        <h3 className="text-2xl font-black border-l-4 border-red-600 pl-4 uppercase tracking-tighter">Знімальна група та склад</h3>
                        <div className="flex gap-2">
                            <button onClick={() => scroll('left')} className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-red-600 transition-all text-gray-400 hover:text-white"><ChevronLeft size={24} /></button>
                            <button onClick={() => scroll('right')} className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-red-600 transition-all text-gray-400 hover:text-white"><ChevronRight size={24} /></button>
                        </div>
                    </div>

                    <div ref={scrollRef} className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {movie.director && (
                            <div className="flex-shrink-0 w-40 sm:w-48 group">
                                <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-3 bg-[#1a1d26] border border-white/5 shadow-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:border-red-600/50">
                                    {movie.director.photoUri ? <img src={movie.director.photoUri} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-900"><User size={48} className="text-gray-700" /></div>}
                                </div>
                                <p className="font-bold text-white truncate text-sm">{movie.director.firstName} {movie.director.lastName}</p>
                                <p className="text-[10px] text-red-500 font-black uppercase mt-1">Режисер</p>
                            </div>
                        )}
                        {movie.actors?.map((actor) => (
                            <div key={actor.id} className="flex-shrink-0 w-40 sm:w-48 group">
                                <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-3 bg-[#1a1d26] border border-white/5 shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                                    {actor.photoUri ? <img src={actor.photoUri} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-900"><User size={40} className="text-gray-700" /></div>}
                                </div>
                                <p className="font-bold text-white truncate text-sm">{actor.firstName} {actor.lastName}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Актор</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* РОЗКЛАД СЕАНСІВ */}
                <section className="bg-[#1a1d26] p-10 rounded-[40px] border border-white/5 shadow-2xl relative z-30">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-600/10 rounded-2xl"><Ticket className="text-red-600" size={32} /></div>
                            <h3 className="text-3xl font-bold tracking-tight">Розклад сеансів</h3>
                        </div>

                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            {dateTabs.map((date, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedDate(date)}
                                    className={`px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                                        date.toDateString() === selectedDate.toDateString()
                                            ? 'bg-red-600 border-red-600 text-white shadow-lg'
                                            : 'bg-white/5 border-transparent text-gray-500 hover:text-white'
                                    }`}
                                >
                                    {idx === 0 ? 'Сьогодні' : idx === 1 ? 'Завтра' : date.toLocaleDateString('uk-UA', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loadingSessions ? (
                        <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-red-600" size={40} /></div>
                    ) : sessions.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 mb-10">
                                {sessions.map(session => (
                                    <SessionItem key={session.id} session={session} variant="client" onClick={handleBuyTicket} />
                                ))}
                            </div>
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
                        </>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-[40px] bg-black/10">
                            <p className="text-gray-400 font-medium text-lg">На цей день сеансів не знайдено.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default MoviePage;