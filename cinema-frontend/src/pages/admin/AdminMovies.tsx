import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { MovieService } from '../../services/movie.service';
import { GenreService } from '../../services/genre.service';
import { DirectorService } from '../../services/director.service';
import { ActorService } from '../../services/actor.service';
import type { CreateMovieDto, MovieDto, MovieFilterDto } from '../../types/movie';
import { Film, Search, Edit, Trash2, Clock, Star, Plus } from 'lucide-react';
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { notify } from "../../utils/toast";
import { UsePagination } from "../../hooks/UsePagination";
import { Pagination } from "../../components/Pagination";
import { PaginationInfo } from "../../components/PaginationInfo";
import { DataTable, type Column } from "../../components/DataTable";
import { MovieForm } from '../../components/AMoviesComponents/MovieForm';
import { QuickCreateModal } from '../../components/AMoviesComponents/QuickCreateModal.tsx';

const ageMap: Record<string, number> = { "ZeroPlus": 0, "TwelvePlus": 1, "SixteenPlus": 2, "EighteenPlus": 3 };

const AdminMovies = () => {
    // --- STATE ---
    const [genres, setGenres] = useState<any[]>([]);
    const [directors, setDirectors] = useState<any[]>([]);
    const [actors, setActors] = useState<any[]>([]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [movieSearch, setMovieSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [modal, setModal] = useState({ isOpen: false, type: '' });
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, movieId: number | null, movieTitle: string }>({
        isOpen: false, movieId: null, movieTitle: ''
    });

    const formMethods = useForm<CreateMovieDto>({
        defaultValues: { genreIds: [], actorIds: [] }
    });

    // --- DATA LOADING ---
    const fetchData = async () => {
        try {
            const [g, d, a] = await Promise.all([
                GenreService.getAll({ Page: 1, PageSize: 100 }),
                DirectorService.getAll({ Page: 1, PageSize: 100 }),
                ActorService.getAll({ Page: 1, PageSize: 100 })
            ]);
            setGenres(g.items);
            setDirectors(d.items);
            setActors(a.items);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { void fetchData(); }, []);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(movieSearch), 600);
        return () => clearTimeout(timer);
    }, [movieSearch]);

    // --- PAGINATION HOOK ---
    const {
        items: movies, totalCount, currentPage, totalPages, pageSize, loading, goToPage, refresh
    } = UsePagination(
        async (page, size) => {
            const filter: MovieFilterDto = { Page: page, PageSize: size };
            if (debouncedSearch.trim()) filter.title = debouncedSearch;
            return await MovieService.getAll(filter);
        },
        [debouncedSearch],
        { pageSize: 8 }
    );

    // --- HANDLERS ---
    const handleEditMovie = (movie: MovieDto) => {
        setEditingId(movie.id);
        formMethods.reset();

        formMethods.setValue('title', movie.title);
        formMethods.setValue('description', movie.description || '');
        formMethods.setValue('durationMin', movie.durationMin || 0);
        formMethods.setValue('basePrice', movie.basePrice);
        formMethods.setValue('rating', movie.rating || 0);
        formMethods.setValue('posterUri', movie.posterUri || '');
        formMethods.setValue('trailerUri', movie.trailerUri || '');
        formMethods.setValue('ageRestriction', ageMap[movie.ageRestriction] ?? 0);

        const formatDate = (d?: string) => d ? d.split('T')[0] : '';
        formMethods.setValue('releaseDate', formatDate(movie.releaseDate));
        formMethods.setValue('startDate', formatDate(movie.startDate));
        formMethods.setValue('endDate', formatDate(movie.endDate));

        if (movie.director) {
            formMethods.setValue('directorId', movie.director.id);
        }

        const gIds = genres
            .filter(g => movie.genres.some(mg => mg.id === g.id))
            .map(g => g.id.toString());
        formMethods.setValue('genreIds', gIds as any);

        const aIds = actors
            .filter(a => movie.actors.some(ma => ma.id === a.id))
            .map(a => a.id.toString());
        formMethods.setValue('actorIds', aIds as any);

        setIsFormOpen(true);
    };

    const onSubmit = async (data: CreateMovieDto) => {
        try {
            const formatted = {
                ...data,
                durationMin: Number(data.durationMin),
                basePrice: Number(data.basePrice),
                rating: Number(data.rating),
                ageRestriction: Number(data.ageRestriction),
                genreIds: data.genreIds ? data.genreIds.map(Number) : [],
                actorIds: data.actorIds ? data.actorIds.map(Number) : [],
                directorId: data.directorId ? Number(data.directorId) : undefined,
                languageIds: []
            };

            if (editingId) await MovieService.update(editingId, formatted);
            else await MovieService.create(formatted);

            await refresh();
            setIsFormOpen(false);
            notify.success(editingId ? "Фільм оновлено" : "Фільм створено");
        } catch (e) {
            console.error(e);
            notify.error("Помилка збереження");
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.movieId) return;
        try {
            await MovieService.delete(deleteConfirm.movieId);
            await refresh();
            setDeleteConfirm({ isOpen: false, movieId: null, movieTitle: '' });
            notify.success("Фільм видалено");
        } catch (e: any) {
            // ВАЖЛИВО: Отримуємо повідомлення з бекенду (BadRequest)
            const errorMsg = e.response?.data?.message || e.message || 'Помилка при видаленні';
            notify.error(errorMsg);
        }
    };

    // --- COLUMNS ---
    const columns: Column<MovieDto>[] = useMemo(() => [
        {
            key: 'poster',
            header: 'Постер',
            render: (movie) => (
                <img
                    src={movie.posterUri}
                    alt={movie.title}
                    className="w-10 h-14 rounded-lg object-cover border border-gray-700 shadow-sm"
                    onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40x60'}
                />
            ),
            width: '80px'
        },
        {
            key: 'title',
            header: 'Назва / Жанри',
            render: (movie) => (
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-white text-sm leading-tight">{movie.title}</span>
                    <div className="flex flex-wrap gap-1">
                        {movie.genres.slice(0, 3).map(g => (
                            <span key={g.id} className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700">
                                {g.name}
                            </span>
                        ))}
                    </div>
                </div>
            )
        },
        {
            key: 'rating',
            header: 'Рейтинг',
            width: '100px',
            align: 'center',
            render: (movie) => (
                <div className="mx-auto w-fit flex items-center justify-center gap-0.5 text-yellow-500 font-bold text-xs bg-yellow-500/10 px-1.5 py-0.5 rounded-md border border-yellow-500/20">
                    <Star size={10} fill="currentColor" /> {movie.rating?.toFixed(1)}
                </div>
            )
        },
        {
            key: 'duration',
            header: 'Час',
            width: '100px',
            render: (movie) => (
                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-mono">
                    <Clock size={12} /> {movie.durationMin} хв
                </div>
            )
        },
        {
            key: 'basePrice',
            header: 'Ціна',
            align: 'right',
            width: '100px',
            render: (movie) => (
                <span className="text-emerald-500 font-black text-sm">
                    {movie.basePrice} ₴
                </span>
            )
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            width: '120px',
            render: (movie) => (
                <div className="flex justify-end gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleEditMovie(movie); }}
                        className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all"
                        title="Редагувати"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, movieId: movie.id, movieTitle: movie.title }); }}
                        className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                        title="Видалити"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ], []);

    return (
        <div className="max-w-7xl mx-auto pb-20 text-white p-4 relative">
            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                title="Видалити фільм?"
                description={<>Ви впевнені, що хочете видалити <span className="text-white font-bold">"{deleteConfirm.movieTitle}"</span>?</>}
                onConfirm={() => void confirmDelete()}
                onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
                variant="danger"
            />

            <QuickCreateModal
                isOpen={modal.isOpen}
                type={modal.type}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onSuccess={fetchData}
            />

            {!isFormOpen ? (
                <div className="animate-fade-in space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-4">
                            <Film className="text-red-600" size={36}/>
                            ФІЛЬМИ
                        </h2>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
                                <input
                                    type="text"
                                    placeholder="Пошук..."
                                    value={movieSearch}
                                    onChange={e => { setMovieSearch(e.target.value); /* goToPage(1) робить хук */ }}
                                    className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-red-600 transition-colors text-sm font-bold text-white"
                                />
                            </div>
                            <button
                                onClick={() => { setEditingId(null); formMethods.reset(); setIsFormOpen(true); }}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all active:scale-95"
                            >
                                <Plus size={16} /> Додати
                            </button>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-[#1a1d26] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden">
                        <DataTable
                            data={movies}
                            columns={columns}
                            loading={loading}
                            emptyMessage={`Нічого не знайдено за запитом "${debouncedSearch}"`}
                            className="border-none bg-transparent shadow-none rounded-none"
                            onRowClick={handleEditMovie}
                        />

                        {/* Футер з пагінацією */}
                        {/* Футер з пагінацією */}
                        {!loading && totalCount > 0 && (
                            <div className="p-4 border-t border-gray-800 bg-gray-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <PaginationInfo
                                    currentPage={currentPage}
                                    pageSize={pageSize}
                                    totalCount={totalCount}
                                    itemName="фільм"
                                />
                                {/* ВИПРАВЛЕНО ТУТ: прибрано зайві пропси */}
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={goToPage}
                                />
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <MovieForm
                    formMethods={formMethods}
                    isEditing={!!editingId}
                    directors={directors}
                    actors={actors}
                    genres={genres}
                    onCancel={() => setIsFormOpen(false)}
                    onSubmit={onSubmit}
                    onAddDirector={() => setModal({ isOpen: true, type: 'directors' })}
                    onAddActor={() => setModal({ isOpen: true, type: 'actors' })}
                    onAddGenre={() => setModal({ isOpen: true, type: 'genres' })}
                />
            )}
        </div>
    );
};

export default AdminMovies;