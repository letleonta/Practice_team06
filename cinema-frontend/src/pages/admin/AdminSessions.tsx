import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SessionService } from '../../services/session.service';
import { MovieService } from '../../services/movie.service';
import type { CreateSessionDto, SessionDto} from '../../types/session';
import type { MovieDto } from '../../types/movie';
import { Calendar, Film, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { HallDto } from "../../types/hall.ts";
import type { LanguageDto } from "../../types/language.ts";
import { HallService } from "../../services/hall.service.ts";
import { LanguageService } from "../../services/language.service.ts";
import { getAgeRestrictionText } from "../../utils/formatAgeRestriction.ts";
import { SessionCreateForm } from "../../components/SessionCreateForm.tsx";
import { ConfirmModal } from "../../components/ui/ConfirmModal.tsx";
import { SessionItem } from "../../components/SessionItem.tsx";
import { notify } from "../../utils/toast";
import { UsePagination } from "../../hooks/UsePagination.ts";

const AdminSessions = () => {
    const { reset } = useForm<CreateSessionDto>();

    const [halls, setHalls] = useState<HallDto[]>([]);
    const [languages, setLanguages] = useState<LanguageDto[]>([]);

    const [selectedMovie, setSelectedMovie] = useState<MovieDto | null>(null);
    const [sessions, setSessions] = useState<SessionDto[]>([]);
    const [movieSearch, setMovieSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [loadingSessions, setLoadingSessions] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null as number | null });

    const {
        items: movies,
        currentPage,
        totalPages,
        loading: loadingMovies,
        goToPage
    } = UsePagination<MovieDto>(
        async (page, size) => {
            return await MovieService.getAll({
                Page: page,
                PageSize: size,
                title: debouncedSearch
            });
        },
        [debouncedSearch],
        { pageSize: 6 }
    );

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(movieSearch), 500);
        return () => clearTimeout(timer);
    }, [movieSearch]);

    useEffect(() => {
        const loadDicts = async () => {
            try {
                const [hRes, lRes] = await Promise.all([
                    HallService.getAll(),
                    LanguageService.getAll()
                ]);
                setHalls(Array.isArray(hRes) ? hRes : (hRes as any).items);
                setLanguages(Array.isArray(lRes) ? lRes : (lRes as any).items);
            } catch (err) {
                console.error("Помилка довідників:", err);
            }
        };
        loadDicts();
    }, []);

    useEffect(() => {
        if (selectedMovie) {
            setLoadingSessions(true);
            SessionService.getByMovieId(selectedMovie.id)
                .then(setSessions)
                .finally(() => setLoadingSessions(false));
        }
    }, [selectedMovie]);

    const onSubmit = async (data: CreateSessionDto) => {
        if (!selectedMovie) return;
        try {
            await SessionService.create({
                ...data,
                movieId: selectedMovie.id,
                hallId: Number(data.hallId),
                languageId: Number(data.languageId)
            });
            notify.success('Сеанс створено!');
            reset();
            const updated = await SessionService.getByMovieId(selectedMovie.id);
            setSessions(updated);
        } catch (err: any) {
            notify.error(err.response?.data?.message || 'Помилка накладання часу');
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
        } finally {
            setDeleteModal({ isOpen: false, id: null });
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 text-white h-[calc(100vh-140px)]">
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

                <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
                    {loadingMovies ? (
                        <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-red-600" /></div>
                    ) : movies.length > 0 ? (
                        movies.map(movie => (
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
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-center p-6">
                            <Film size={40} className="mb-3 opacity-20" />
                            <p className="font-bold text-sm">Фільмів не знайдено</p>
                            <p className="text-xs mt-1 opacity-70">Спробуйте змінити пошук або додайте фільми у розділі "Фільми"</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="p-3 border-t border-gray-800 bg-gray-900/20 flex items-center justify-between">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => goToPage(currentPage - 1)}
                            className="p-2 hover:bg-gray-800 rounded-lg disabled:opacity-20"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-[10px] font-black uppercase text-gray-500">
                            Стор. {currentPage} / {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => goToPage(currentPage + 1)}
                            className="p-2 hover:bg-gray-800 rounded-lg disabled:opacity-20"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            <div className="w-full lg:w-2/3 flex flex-col gap-6">
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
                description="Квитки на цей сеанс стануть недійсними."
                onConfirm={confirmDelete}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
            />
        </div>
    );
};

export default AdminSessions;