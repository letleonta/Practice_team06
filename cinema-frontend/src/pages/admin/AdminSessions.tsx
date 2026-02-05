import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { SessionService } from '../../services/session.service';
import { MovieService } from '../../services/movie.service';
import type { CreateSessionDto, SessionDto} from '../../types/session';
import type { MovieDto } from '../../types/movie';
import {Calendar, Film, Search, Loader2 } from 'lucide-react';
import type {HallDto} from "../../types/hall.ts";
import type {LanguageDto} from "../../types/language.ts";
import {HallService} from "../../services/hall.service.ts";
import {LanguageService} from "../../services/language.service.ts";
import {getAgeRestrictionText} from "../../utils/formatAgeRestriction.ts";
import {SessionCreateForm} from "../../components/SessionCreateForm.tsx";
import {ConfirmModal} from "../../components/ui/ConfirmModal.tsx";
import {SessionItem} from "../../components/SessionItem.tsx";
import {notify} from "../../utils/toast";

const AdminSessions = () => {
    const { reset } = useForm<CreateSessionDto>();

    // --- ДАНІ ---
    const [movies, setMovies] = useState<MovieDto[]>([]);
    const [halls, setHalls] = useState<HallDto[]>([]);
    const [languages, setLanguages] = useState<LanguageDto[]>([]);

    // --- СТАН ---
    const [selectedMovie, setSelectedMovie] = useState<MovieDto | null>(null);
    const [sessions, setSessions] = useState<SessionDto[]>([]);
    const [movieSearch, setMovieSearch] = useState('');
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true); // Стан завантаження списку
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null as number | null });

    // Завантаження довідників при старті (ОДИН РАЗ)
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoadingData(true);
            try {
                const [m, h, l] = await Promise.all([
                    MovieService.getAll(),
                    HallService.getAll(),
                    LanguageService.getAll()
                ]);
                setMovies(m);
                setHalls(h);
                setLanguages(l);
            } catch (err) {
                console.error("Помилка завантаження даних:", err);
                notify.error("Не вдалося завантажити дані. Перевір з'єднання з сервером.");
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
            SessionService.getByMovieId(selectedMovie.id)
                .then(setSessions)
                .catch(console.error)
                .finally(() => setLoadingSessions(false));
        } else {
            setSessions([]);
        }
    }, [selectedMovie]);

    const onSubmit = async (data: CreateSessionDto) => {
        if (!selectedMovie) return notify.error("Оберіть фільм!");

        try {
            const formattedData = {
                movieId: selectedMovie.id,
                hallId: Number(data.hallId),
                languageId: Number(data.languageId),
                startTime: data.startTime
            };

            await SessionService.create(formattedData);
            notify.success('Сеанс створено!');
            reset();
            const updatedSessions = await SessionService.getByMovieId(selectedMovie.id);
            setSessions(updatedSessions);
        } catch (err: any) {
            notify.error('Помилка: ' + (err.response?.data?.message || 'Накладання часу або помилка сервера'));
        }
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        try {
            await SessionService.delete(deleteModal.id);
            if (selectedMovie) {
                const updated = await SessionService.getByMovieId(selectedMovie.id);
                setSessions(updated);
            }
        } catch (err) {
            notify.error('Помилка видалення');
        } finally {
            setDeleteModal({ isOpen: false, id: null });
        }
    };

    const filteredMovies = useMemo(() => movies.filter(m =>
        m.title.toLowerCase().includes(movieSearch.toLowerCase())
    ), [movies, movieSearch]);

    return (
        <div className="flex flex-col lg:flex-row gap-8 text-white h-[calc(100vh-100px)]">

            {/* ЛІВА КОЛОНКА: ВИБІР ФІЛЬМУ */}
            <div className="w-full lg:w-1/3 bg-[#1a1d26] rounded-4xl border border-gray-800 shadow-2xl flex flex-col overflow-hidden">
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
                            <div className="w-12 h-16 bg-gray-800 rounded-xl overflow-hidden shrink-0 shadow-sm border border-black/20">
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
                                    {movie.durationMin} хв • {getAgeRestrictionText(movie.ageRestriction)}
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
                    <SessionCreateForm
                        movie={selectedMovie}
                        halls={halls}
                        languages={languages}
                        onSubmit={onSubmit}
                    />
                ) : (
                    <div className="bg-[#1a1d26] p-10 rounded-4xl border border-gray-800 border-dashed flex flex-col items-center justify-center text-gray-500 h-40 animate-pulse">
                        <Film size={40} className="mb-2 opacity-20" />
                        <p className="font-bold">Оберіть фільм зліва</p>
                        <p className="text-xs">щоб керувати його розкладом</p>
                    </div>
                )}

                {/* Список сеансів */}
                <div className="bg-[#1a1d26] flex-1 rounded-4xl border border-gray-800 shadow-xl overflow-hidden flex flex-col">
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
                                    <SessionItem
                                        key={session.id}
                                        session={session}
                                        onDelete={(id) => setDeleteModal({ isOpen: true, id })}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Видалити сеанс?"
                description="Це дію неможливо буде скасувати"
                onConfirm={confirmDelete}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
            />
        </div>
    );
};

export default AdminSessions;