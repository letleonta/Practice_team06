import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { MovieService } from '../services/movie.service';
import type { MovieDto } from '../types/movie';
import type { SessionDto } from '../types/session';
import { Clock, Calendar, Star, Ticket, ArrowLeft, PlayCircle } from 'lucide-react';
import {formatDate, formatTime} from "../utils/formatTime.ts";
import {getAgeRestrictionText} from "../utils/formatAgeRestriction.ts";

const MoviePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [movie, setMovie] = useState<MovieDto | null>(null);
    const [sessions, setSessions] = useState<SessionDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const movieData = await MovieService.getById(Number(id));
                const sessionRes = await api.get<SessionDto[]>(`/sessions/by-movie/${id}`);

                setMovie(movieData);
                setSessions(sessionRes.data);
            } catch (err) {
                console.error("Error loading movie details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleBuyTicket = (sessionId: number) => {
        navigate(`/sessions/${sessionId}`);
    };

    // Функція для отримання ID відео з YouTube посилання
    const getYouTubeId = (url?: string) => {
        if (!url) return null;
        const regExp = /^.*(?:youtu.be\/|v\/|e\/|u\/\w\/|embed\/|v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[1].length === 11) ? match[1] : null;
    };

    const trailerId = getYouTubeId(movie?.trailerUri);

    if (loading) return (
        <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!movie) return <div className="text-white text-center py-20">Фільм не знайдено</div>;

    return (
        <div className="min-h-screen bg-[#0f1117] text-white font-sans overflow-x-hidden">

            {/* ВЕЛИКИЙ ТРЕЙЛЕР НА ФОНІ */}
            <div className="relative h-[85vh] w-full bg-black overflow-hidden group">
                {trailerId ? (
                    <div className="absolute inset-0 w-full h-full scale-[1.35]">
                        <iframe
                            className="w-full h-full opacity-70 pointer-events-none"
                            src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerId}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
                            title="Trailer"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            style={{ border: 'none' }}
                        />
                    </div>
                ) : (
                    <img src={movie.posterUri} alt="" className="w-full h-full object-cover opacity-40 blur-sm" />
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1d26]/40 via-transparent to-[#0f1117] z-10"></div>
                <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#0f1117] via-[#0f1117]/90 to-transparent z-10"></div>

                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-24 left-6 z-40 bg-black/60 hover:bg-red-600 p-3 rounded-full backdrop-blur-md transition-all text-white border border-white/10 group"
                >
                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
            </div>

            {/* ОСНОВНИЙ КОНТЕНТ */}
            <div className="max-w-7xl mx-auto px-6 -mt-96 relative z-20 pb-20">

                {/* 1. ВЕРХНІЙ БЛОК: ПОСТЕР ТА ІНФО (ВКЛЮЧАЮЧИ КОМАНДУ) */}
                <div className="flex flex-col md:flex-row gap-10 items-start mb-16">

                    {/* Постер */}
                    <div className="w-64 sm:w-80 md:w-1/4 shrink-0 mx-auto md:mx-0 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden border-4 border-[#1a1d26] relative group bg-[#1a1d26]">
                        <img src={movie.posterUri || 'no-poster.jpg'} alt={movie.title} className="w-full h-auto object-cover" />
                        {movie.trailerUri && (
                            <a href={movie.trailerUri} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col gap-2 items-center justify-center transition-all cursor-pointer backdrop-blur-sm">
                                <PlayCircle size={64} className="text-red-600 drop-shadow-lg" />
                                <span className="text-white font-bold text-sm uppercase tracking-widest">Дивитись трейлер</span>
                            </a>
                        )}
                    </div>

                    {/* Назва, Метрики, Режисер та Актори */}
                    <div className="flex-1 w-full pt-2">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className="bg-red-600 px-2.5 py-0.5 rounded text-sm font-bold shadow-lg shadow-red-600/20">
                                {getAgeRestrictionText(movie.ageRestriction)}
                            </span>
                            {movie.genres?.map(g => (
                                <span key={g} className="bg-white/10 border border-white/20 px-3 py-1 rounded text-xs font-bold text-white uppercase tracking-wide">
                                    {g}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none text-white drop-shadow-2xl">
                            {movie.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-gray-200 mb-10 font-medium text-base">
                            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10"><Clock className="text-red-500" size={20} /> <span>{movie.durationMin} хв</span></div>
                            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10"><Calendar className="text-red-500" size={20} /> <span>{formatDate(movie.releaseDate)}</span></div>
                            {movie.rating && (<div className="flex items-center gap-2 text-yellow-400 bg-black/40 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10"><Star fill="currentColor" size={20} /> <span className="text-white font-bold text-lg">{movie.rating.toFixed(1)}</span></div>)}
                        </div>

                        {/* Команда фільму (піднята вгору) */}
                        <div className="flex flex-col gap-8">
                            {movie.directorName && movie.directorName !== "Unknown" && (
                                <div className="space-y-3">
                                    <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Режисер</h4>
                                    <div className="inline-block bg-white/5 px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-lg shadow-xl">
                                        {movie.directorName}
                                    </div>
                                </div>
                            )}

                            {movie.actors && movie.actors.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider">У головних ролях</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {movie.actors.map(actor => (
                                            <span key={actor} className="bg-white/5 px-5 py-3 rounded-xl text-sm text-gray-300 border border-white/10 font-bold shadow-lg">
                                                {actor}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. БЛОК "ПРО ФІЛЬМ" (Нижче постера на всю ширину) */}
                <div className="mb-12">
                    <div className="bg-[#1a1d26]/80 p-10 rounded-[40px] border border-white/5 backdrop-blur-md shadow-2xl">
                        <h3 className="text-white font-bold text-2xl mb-6">Про фільм</h3>
                        <p className="text-gray-300 leading-relaxed text-xl max-w-5xl">
                            {movie.description || "Опис відсутній."}
                        </p>
                    </div>
                </div>

                {/* 3. РОЗКЛАД СЕАНСІВ (Нижче всієї інфи) */}
                <div className="bg-[#1a1d26] p-10 rounded-[40px] border border-white/5 shadow-2xl relative z-30">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="p-3 bg-red-600/10 rounded-2xl">
                            <Ticket className="text-red-600" size={32} />
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight">Розклад сеансів</h3>
                    </div>

                    {sessions.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                            {sessions.map(session => (
                                <button
                                    key={session.id}
                                    onClick={() => handleBuyTicket(session.id)}
                                    className="group flex flex-col items-center justify-center bg-[#0f1117] hover:bg-red-600 border border-white/5 hover:border-red-500 rounded-[28px] py-5 px-3 transition-all duration-300 shadow-lg hover:-translate-y-2"
                                >
                                    {/* Дата (наприклад, 4 лют.) */}
                                    <span className="text-[11px] text-red-500 group-hover:text-red-100 font-black uppercase tracking-tighter mb-1 transition-colors">
                                        {new Date(session.startTime).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                                    </span>
                                    {/* Час */}
                                    <span className="text-2xl font-black text-white group-hover:scale-110 transition-transform">
                                        {formatTime(session.startTime)}
                                    </span>
                                    {/* Зал */}
                                    <span className="text-[10px] text-gray-600 group-hover:text-white/80 font-bold uppercase tracking-widest mt-2">
                                        {session.hallName}
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-[40px]">
                            <p className="text-gray-500 font-medium text-xl italic">На жаль, активних сеансів на цей фільм поки немає.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MoviePage;