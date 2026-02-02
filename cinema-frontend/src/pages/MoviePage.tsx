import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import type { MovieDto } from '../types/movie';
import type { SessionDto } from '../types/session';
import { Clock, Calendar, Star, Ticket, ArrowLeft, PlayCircle } from 'lucide-react';

const MoviePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [movie, setMovie] = useState<MovieDto | null>(null);
    const [sessions, setSessions] = useState<SessionDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get<MovieDto>(`/movies/${id}`),
            api.get<SessionDto[]>(`/sessions/by-movie/${id}`)
        ])
            .then(([movieRes, sessionRes]) => {
                setMovie(movieRes.data);
                setSessions(sessionRes.data);
            })
            .catch(err => console.error("Error loading movie details:", err))
            .finally(() => setLoading(false));
    }, [id]);

    const handleBuyTicket = (sessionId: number) => {
        navigate(`/sessions/${sessionId}`);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('uk-UA', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('uk-UA', {
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatAge = (age: string) => {
        const map: Record<string, string> = {
            'ZeroPlus': '0+', 'TwelvePlus': '12+',
            'SixteenPlus': '16+', 'EighteenPlus': '18+'
        };
        return map[age] || age;
    };

    // Функція для отримання ID відео з YouTube посилання
    const getYouTubeId = (url?: string) => {
        if (!url) return null;
        // Підтримує формати: watch?v=ID, youtu.be/ID, embed/ID
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
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

            {/* Верхній фон (Backdrop) */}
            <div className="relative h-[60vh] w-full bg-black overflow-hidden group">

                {/* ВІДЕО ФОН (Якщо є трейлер) */}
                {trailerId ? (
                    <div className="absolute inset-0 w-full h-full scale-125 group-hover:scale-100 transition-transform duration-[2s]">
                        <iframe
                            className="w-full h-full opacity-60 pointer-events-none"
                            src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerId}&showinfo=0&modestbranding=1`}
                            title="Trailer"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            style={{ border: 'none' }}
                        />
                    </div>
                ) : (
                    // Якщо трейлера немає - показуємо розмитий постер
                    <img
                        src={movie.posterUri}
                        alt=""
                        className="w-full h-full object-cover opacity-30 blur-sm"
                    />
                )}

                {/* Градієнт, щоб текст читався */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1d26]/50 via-[#0f1117]/40 to-[#0f1117] z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-transparent to-transparent z-10"></div>

                {/* Кнопка назад */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 z-50 bg-black/60 hover:bg-red-600 p-3 rounded-full backdrop-blur-md transition-all text-white border border-white/10 group"
                >
                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Основний контент */}
            <div className="max-w-7xl mx-auto px-6 -mt-64 relative z-20 pb-10">
                <div className="flex flex-col md:flex-row gap-8 items-start">

                    {/* Ліва колонка: Постер */}
                    <div className="w-48 sm:w-64 md:w-1/4 shrink-0 mx-auto md:mx-0 shadow-2xl rounded-2xl overflow-hidden border-4 border-[#1a1d26] relative group bg-[#1a1d26] z-30">
                        <img
                            src={movie.posterUri || 'no-poster.jpg'}
                            alt={movie.title}
                            className="w-full h-auto object-cover"
                        />
                        {/* Кнопка "Дивитися трейлер" зі звуком */}
                        {movie.trailerUri && (
                            <a
                                href={movie.trailerUri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col gap-2 items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
                            >
                                <PlayCircle size={64} className="text-red-600 drop-shadow-lg scale-100 group-hover:scale-110 transition-transform" />
                                <span className="text-white font-bold text-sm uppercase tracking-widest">Дивитись трейлер</span>
                            </a>
                        )}
                    </div>

                    {/* Права колонка: Інфо */}
                    <div className="flex-1 w-full pt-2 md:pt-24">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className="bg-red-600 px-2.5 py-0.5 rounded text-sm font-bold shadow-lg shadow-red-600/20">
                                {formatAge(movie.ageRestriction)}
                            </span>
                            {movie.genres?.map(g => (
                                <span key={g} className="bg-gray-800/80 backdrop-blur border border-gray-700 px-2.5 py-0.5 rounded text-xs font-bold text-gray-300 uppercase tracking-wide">
                                    {g}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4 leading-tight text-white drop-shadow-2xl">
                            {movie.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-8 font-medium text-sm md:text-base drop-shadow-md">
                            <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                                <Clock className="text-red-500" size={18} />
                                <span>{movie.durationMin} хв</span>
                            </div>
                            <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                                <Calendar className="text-red-500" size={18} />
                                <span>{formatDate(movie.releaseDate)}</span>
                            </div>
                            {movie.rating && (
                                <div className="flex items-center gap-2 text-yellow-500 bg-black/30 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                                    <Star fill="currentColor" size={18} />
                                    <span className="text-white font-bold">{movie.rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>

                        {/* Секція: Розклад сеансів */}
                        <div className="bg-[#1a1d26] p-6 rounded-2xl border border-gray-800 shadow-2xl mb-8 relative z-30">
                            <div className="flex items-center gap-3 mb-6">
                                <Ticket className="text-red-600" size={24} />
                                <h3 className="text-xl font-bold">Розклад сеансів</h3>
                            </div>

                            {sessions.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {sessions.map(session => (
                                        <button
                                            key={session.id}
                                            onClick={() => handleBuyTicket(session.id)}
                                            className="group flex flex-col items-center justify-center bg-gray-900 hover:bg-red-600 border border-gray-700 hover:border-red-500 rounded-xl py-3 px-5 min-w-[90px] transition-all duration-300 shadow-lg"
                                        >
                                            <span className="text-lg font-black text-white group-hover:scale-110 transition-transform">
                                                {formatTime(session.startTime)}
                                            </span>
                                            <span className="text-[10px] text-gray-500 group-hover:text-red-100 mt-1 truncate max-w-[80px] font-medium uppercase">
                                                {session.hallName}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed border-gray-800 rounded-xl">
                                    <p className="text-gray-500 font-medium">На жаль, активних сеансів поки немає.</p>
                                </div>
                            )}
                        </div>

                        {/* Опис та команда */}
                        <div className="space-y-6 text-gray-300 leading-relaxed max-w-4xl relative z-30">
                            <div>
                                <h3 className="text-white font-bold text-xl mb-2 flex items-center gap-2">
                                    Про фільм
                                    <div className="h-px bg-gray-800 flex-1 ml-4"></div>
                                </h3>
                                <p className="text-lg leading-relaxed text-gray-400">{movie.description || "Опис відсутній."}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                                {movie.directorName && movie.directorName !== "Unknown" && (
                                    <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-800">
                                        <h4 className="text-gray-500 text-xs font-bold uppercase mb-1 tracking-wider">Режисер</h4>
                                        <p className="text-white font-bold text-lg">{movie.directorName}</p>
                                    </div>
                                )}

                                {movie.actors && movie.actors.length > 0 && (
                                    <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-800">
                                        <h4 className="text-gray-500 text-xs font-bold uppercase mb-1 tracking-wider">У головних ролях</h4>
                                        <p className="text-white font-medium">{movie.actors.join(', ')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoviePage;