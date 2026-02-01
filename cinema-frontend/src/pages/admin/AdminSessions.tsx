import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { sessionService } from '../../services/sessionService';
import { movieService } from '../../services/movieService';
import type { CreateSessionDto, SessionDto, HallDto, LanguageDto } from '../../types/session';
import type { Movie } from '../../types/movie';
import {Calendar, Film, MapPin, Plus, Search, Trash2, Languages, Loader2, Clock} from 'lucide-react';

const AdminSessions = () => {
    const { register, handleSubmit, reset } = useForm<CreateSessionDto>();

    // --- ДАНІ ---
    const [movies, setMovies] = useState<Movie[]>([]);
    const [halls, setHalls] = useState<HallDto[]>([]);
    const [languages, setLanguages] = useState<LanguageDto[]>([]);

    // --- СТАН ---
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [sessions, setSessions] = useState<SessionDto[]>([]);
    const [movieSearch, setMovieSearch] = useState('');
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true); // Стан завантаження списку

    // Завантаження довідників при старті (ОДИН РАЗ)
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoadingData(true);
            try {
                const [m, h, l] = await Promise.all([
                    movieService.getAll(),
                    sessionService.getHalls(),
                    sessionService.getLanguages()
                ]);
                setMovies(m);
                setHalls(h);
                setLanguages(l);
            } catch (err) {
                console.error("Помилка завантаження даних:", err);
                alert("Не вдалося завантажити дані. Перевір з'єднання з сервером.");
            } finally {
                setIsLoadingData(false);
            }
        };
        loadInitialData();
    }, []);

    // Завантаження сеансів при виборі фільму
    useEffect(() => {
        if (selectedMovie) {
            setLoadingSessions(true);
            sessionService.getByMovie(selectedMovie.id)
                .then(setSessions)
                .catch(console.error)
                .finally(() => setLoadingSessions(false));
        } else {
            setSessions([]);
        }
    }, [selectedMovie]);

    const onSubmit = async (data: CreateSessionDto) => {
        if (!selectedMovie) return alert("Оберіть фільм!");

        try {
            const formattedData = {
                movieId: selectedMovie.id,
                hallId: Number(data.hallId),
                languageId: Number(data.languageId),
                startTime: data.startTime
            };

            await sessionService.create(formattedData);
            alert('Сеанс створено!');
            reset();
            const updatedSessions = await sessionService.getByMovie(selectedMovie.id);
            setSessions(updatedSessions);
        } catch (err: any) {
            alert('Помилка: ' + (err.response?.data?.message || 'Накладання часу або помилка сервера'));
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Видалити цей сеанс?')) return;
        try {
            await sessionService.delete(id);
            if (selectedMovie) {
                const updated = await sessionService.getByMovie(selectedMovie.id);
                setSessions(updated);
            }
        } catch (err) { alert('Не вдалося видалити'); }
    };

    const filteredMovies = useMemo(() => movies.filter(m =>
        m.title.toLowerCase().includes(movieSearch.toLowerCase())
    ), [movies, movieSearch]);

    return (
        <div className="flex flex-col lg:flex-row gap-8 text-white h-[calc(100vh-100px)]">

            {/* ЛІВА КОЛОНКА: ВИБІР ФІЛЬМУ */}
            <div className="w-full lg:w-1/3 bg-[#1a1d26] rounded-[32px] border border-gray-800 shadow-2xl flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-xl font-black flex items-center gap-2 mb-4 uppercase tracking-tighter">
                        <Film className="text-red-600" /> Оберіть фільм
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Пошук..."
                            value={movieSearch}
                            onChange={(e) => setMovieSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl outline-none focus:border-red-500 text-sm transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
                    {/* 1. Стан завантаження */}
                    {isLoadingData && (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                            <Loader2 className="animate-spin mb-2 text-red-600" size={32} />
                            <p className="text-xs font-bold uppercase tracking-widest">Завантаження...</p>
                        </div>
                    )}

                    {/* 2. Якщо нічого не знайдено */}
                    {!isLoadingData && filteredMovies.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-center p-6">
                            <Film size={40} className="mb-3 opacity-20" />
                            <p className="font-bold text-sm">Фільмів не знайдено</p>
                            <p className="text-xs mt-1 opacity-70">Спробуйте змінити пошук або додайте фільми у розділі "Фільми"</p>
                        </div>
                    )}

                    {/* 3. Список фільмів */}
                    {!isLoadingData && filteredMovies.map(movie => (
                        <button
                            key={movie.id}
                            onClick={() => setSelectedMovie(movie)}
                            className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all border text-left group
                                ${selectedMovie?.id === movie.id
                                ? 'bg-red-600 border-red-500 shadow-lg shadow-red-900/50'
                                : 'bg-gray-900/50 border-gray-800 hover:bg-gray-800 hover:border-gray-600'}`}
                        >
                            <div className="w-12 h-16 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-black/20">
                                {movie.posterUri ? (
                                    <img
                                        src={movie.posterUri}
                                        alt={movie.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <Film size={16} />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-sm truncate text-white">{movie.title}</h3>
                                <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${selectedMovie?.id === movie.id ? 'text-red-200' : 'text-gray-500'}`}>
                                    {movie.durationMin} хв • {movie.ageRestriction}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ПРАВА КОЛОНКА: КЕРУВАННЯ СЕАНСАМИ */}
            <div className="w-full lg:w-2/3 flex flex-col gap-6">

                {/* Форма створення (тільки якщо вибрано фільм) */}
                {selectedMovie ? (
                    <div className="bg-[#1a1d26] p-6 rounded-[32px] border border-gray-800 shadow-xl animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                                <Calendar className="text-red-600" /> Розклад: <span className="text-red-500">{selectedMovie.title}</span>
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="md:col-span-1">
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Зал</label>
                                <select {...register('hallId', { required: true })} className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl outline-none focus:border-red-500 cursor-pointer">
                                    <option value="">Оберіть зал</option>
                                    {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                </select>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Мова / Тип</label>
                                <select {...register('languageId', { required: true })} className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl outline-none focus:border-red-500 cursor-pointer">
                                    <option value="">Оберіть мову</option>
                                    {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Дата і час</label>
                                <input
                                    type="datetime-local"
                                    {...register('startTime', { required: true })}
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl outline-none focus:border-red-500 text-sm"
                                />
                            </div>

                            <button className="w-full bg-white text-black font-black p-3 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2">
                                <Plus size={18} /> ДОДАТИ
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-[#1a1d26] p-10 rounded-[32px] border border-gray-800 border-dashed flex flex-col items-center justify-center text-gray-500 h-40 animate-pulse">
                        <Film size={40} className="mb-2 opacity-20" />
                        <p className="font-bold">Оберіть фільм зліва</p>
                        <p className="text-xs">щоб керувати його розкладом</p>
                    </div>
                )}

                {/* Список сеансів */}
                <div className="bg-[#1a1d26] flex-1 rounded-[32px] border border-gray-800 shadow-xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-800 bg-gray-900/30">
                        <h3 className="font-bold flex items-center gap-2">Активні сеанси <span className="bg-gray-800 px-2 py-0.5 rounded text-xs text-white">{sessions.length}</span></h3>
                    </div>

                    <div className="overflow-y-auto flex-1 p-4">
                        {loadingSessions ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                                <Loader2 className="animate-spin mb-2 text-red-600" size={24} />
                                <p className="text-xs">Завантаження розкладу...</p>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10 opacity-50">
                                <Calendar size={40} className="mb-2" />
                                <p className="text-sm">Немає запланованих сеансів</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {sessions.map(session => (
                                    <div key={session.id} className="bg-gray-900 p-4 rounded-2xl border border-gray-800 flex justify-between items-start group hover:border-gray-600 transition hover:bg-gray-800/50">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="bg-red-600/20 text-red-500 p-2 rounded-xl">
                                                    <Clock size={18} />
                                                </div>
                                                <span className="font-black text-xl text-white tracking-tight">
                                                    {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                            <div className="space-y-1.5 ml-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                                    <Calendar size={12} /> {new Date(session.startTime).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-300 font-bold">
                                                    <MapPin size={12} className="text-red-500" /> {session.hallName}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                                    <Languages size={10} /> {session.languageName}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(session.id)}
                                            className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition opacity-0 group-hover:opacity-100"
                                            title="Скасувати сеанс"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSessions;