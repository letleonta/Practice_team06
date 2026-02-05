import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axiosInstance';
import { MovieService } from '../../services/movie.service';
import type {CreateMovieDto, MovieDto, MovieFilterDto} from '../../types/movie';
import {
    Film, Search, Edit, Trash2,
    ArrowLeft, Save, PlayCircle, Info, Image, Users,
    Hash, X, Clock, Star
} from 'lucide-react';
import {ConfirmModal} from "../../components/ui/ConfirmModal.tsx";
import {notify} from "../../utils/toast";
import {UsePagination} from "../../hooks/UsePagination.ts";
import {Pagination} from "../../components/Pagination.tsx";
import {PaginationInfo} from "../../components/PaginationInfo.tsx";
import {MultipleSelectGrid} from "../../components/Form/MultipleSelectGrid.tsx";
import {FormSection, FormSelect, FormTextarea, FormInput} from "../../components/Form/FormSection.tsx";
import {SingleSelectGrid} from "../../components/Form/SingleSelectGrid.tsx";

interface NamedEntity { id: number; name: string; }
interface PersonEntity { id: number; firstName: string; lastName: string; }

const ageMap: Record<string, number> = { "ZeroPlus": 0, "TwelvePlus": 1, "SixteenPlus": 2, "EighteenPlus": 3 };

const AdminMovies = () => {
    const { register, handleSubmit, reset, setValue, watch } = useForm<CreateMovieDto>({
        defaultValues: {
            genreIds: [],
            actorIds: []
        }
    });

    const selectedDirectorId = watch('directorId');
    const selectedGenreIds = watch('genreIds') || [];
    const selectedActorIds = watch('actorIds') || [];

    const [genres, setGenres] = useState<NamedEntity[]>([]);
    const [directors, setDirectors] = useState<PersonEntity[]>([]);
    const [actors, setActors] = useState<PersonEntity[]>([]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [movieSearch, setMovieSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [pages, setPages] = useState({ director: 1, actor: 1, genre: 1 });

    const [modal, setModal] = useState({ isOpen: false, type: '', firstName: '', lastName: '', name: '', photoUri: '' });
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, movieId: number | null, movieTitle: string }>({
        isOpen: false, movieId: null, movieTitle: ''
    });

    const fetchData = async () => {
        try {
            const [g, d, a] = await Promise.all([
                api.get('/genres'),
                api.get('/directors'),
                api.get('/actors')
            ]);
            setGenres(g.data);
            setDirectors(d.data);
            setActors(a.data);
        } catch (_err) {
            console.error("Error loading dictionaries");
        }
    };

    useEffect(() => { void fetchData(); }, []);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(movieSearch), 600);
        return () => clearTimeout(timer);
    }, [movieSearch]);

    const toggleSelection = (id: string, field: 'genreIds' | 'actorIds') => {
        const currentValues: string[] = (watch(field) as unknown as string[]) || [];
        const newValues = currentValues.includes(id)
            ? currentValues.filter(v => v !== id)
            : [...currentValues, id];
        setValue(field, newValues as any);
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.movieId) return;
        try {
            await MovieService.delete(deleteConfirm.movieId);
            await fetchData();
            setDeleteConfirm({ isOpen: false, movieId: null, movieTitle: '' });
        } catch (_err) { notify.error('Помилка при видаленні'); }
    };

    const handleEditMovie = (movie: MovieDto) => {
        setEditingId(movie.id);
        reset();
        setPages({ director: 1, actor: 1, genre: 1 });

        setValue('title', movie.title);
        setValue('description', movie.description || '');
        setValue('durationMin', movie.durationMin || 0);
        setValue('basePrice', movie.basePrice);
        setValue('rating', movie.rating || 0);
        setValue('posterUri', movie.posterUri || '');
        setValue('trailerUri', movie.trailerUri || '');
        setValue('ageRestriction', ageMap[movie.ageRestriction] ?? 0);

        const formatDate = (d?: string) => d ? d.split('T')[0] : '';
        setValue('releaseDate', formatDate(movie.releaseDate));
        setValue('startDate', formatDate(movie.startDate));
        setValue('endDate', formatDate(movie.endDate));

        const foundDir = directors.find(d => movie.directorName.includes(d.lastName));
        if (foundDir) setValue('directorId', foundDir.id);

        const gIds = genres.filter(g => movie.genres.includes(g.name)).map(g => g.id.toString());
        setValue('genreIds', gIds as any);

        const aIds = actors.filter(a => movie.actors.some(an => an.includes(a.lastName))).map(a => a.id.toString());
        setValue('actorIds', aIds as any);

        setIsFormOpen(true);
    };

    const {
        items: movies,
        totalCount,
        currentPage,
        totalPages,
        pageSize,
        loading,
        goToPage
    } = UsePagination(
        async (page, size) => {
            const filter: MovieFilterDto = {
                Page: page,
                PageSize: size
            };

            if (debouncedSearch && debouncedSearch.trim() !== "") {
                filter.title = debouncedSearch;
            }

            return await MovieService.getAll(filter);
        },
        [debouncedSearch],
        { pageSize: 2 }
    );

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
            await fetchData();
            setIsFormOpen(false);
        } catch (_err) { console.error("Error submitting form"); }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 text-white p-4 relative">
            {/* Попап видалення */}
            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                title="Видалити фільм?"
                description={
                    <>Ви впевнені, що хочете видалити <br/>
                        <span className="text-white font-bold">"{deleteConfirm.movieTitle}"</span>?</>
                }
                onConfirm={() => void confirmDelete()}
                onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
            />

            {/* Попап додавання */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-[#1a1d26] border border-gray-800 p-8 rounded-[40px] w-full max-w-lg shadow-2xl scale-in">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black uppercase">Додати {modal.type}</h3>
                            <button onClick={() => setModal(p => ({ ...p, isOpen: false }))}><X size={24}/></button>
                        </div>
                        <div className="space-y-4">
                            {['actors', 'directors'].includes(modal.type) ? (
                                <>
                                    <input className="w-full bg-gray-900 border border-gray-700 p-4 rounded-2xl outline-none text-white font-bold shadow-inner" placeholder="Ім'я" value={modal.firstName} onChange={e => setModal({...modal, firstName: e.target.value})}/>
                                    <input className="w-full bg-gray-900 border border-gray-700 p-4 rounded-2xl outline-none text-white font-bold shadow-inner" placeholder="Прізвище" value={modal.lastName} onChange={e => setModal({...modal, lastName: e.target.value})}/>
                                </>
                            ) : (
                                <input className="w-full bg-gray-900 border border-gray-700 p-4 rounded-2xl outline-none text-white font-bold shadow-inner" placeholder="Назва" value={modal.name} onChange={e => setModal({...modal, name: e.target.value})}/>
                            )}
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setModal(p => ({ ...p, isOpen: false }))} className="flex-1 py-4 rounded-2xl bg-gray-800 font-black text-xs text-white">Скасувати</button>
                            <button onClick={async () => {
                                const p = ['actors', 'directors'].includes(modal.type) ? {firstName: modal.firstName, lastName: modal.lastName} : {name: modal.name};
                                await api.post(`/${modal.type}`, p);
                                await fetchData();
                                setModal(prev => ({...prev, isOpen: false}));
                            }} className="flex-1 py-4 rounded-2xl bg-red-600 font-black text-xs text-white">Зберегти</button>
                        </div>
                    </div>
                </div>
            )}

            {!isFormOpen ? (
                <div className="animate-fade-in">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                        <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-4">
                            <Film className="text-red-600" size={36}/>
                            КЕРУВАННЯ ФІЛЬМАМИ
                        </h2>
                        <button
                            onClick={() => { setEditingId(null); reset(); setIsFormOpen(true); }}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px]
                            tracking-widest shadow-xl shadow-red-600/20 transition-all active:scale-95"
                        >
                            + Додати новий фільм
                        </button>
                    </div>

                    <div className="bg-[#1a1d26]/60 rounded-[40px] border border-gray-800 shadow-2xl backdrop-blur-md overflow-hidden">
                        <div className="p-8 border-b border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="px-4 py-2 bg-gray-900/80 rounded-full border border-gray-800 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                                    Всього у базі: {totalCount}
                                </div>
                            </div>
                            <div className="relative w-full md:w-100">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
                                <input
                                    type="text"
                                    placeholder="Пошук фільму..."
                                    value={movieSearch}
                                    onChange={e => {
                                        setMovieSearch(e.target.value);
                                        goToPage(1);
                                    }}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/20 transition-all font-bold text-white placeholder:text-gray-600 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="p-4 space-y-3">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-24 gap-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                                    <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest">Синхронізація з базою...</p>
                                </div>
                            ) : movies.length > 0 ? (
                                movies.map(movie => (
                                    <div
                                        key={movie.id}
                                        className="group flex flex-col md:flex-row items-center gap-6 p-5 bg-gray-900/30 hover:bg-white/3 border border-gray-800/40 rounded-4xl transition-all duration-300"
                                    >
                                        <div className="relative shrink-0">
                                            <img
                                                src={movie.posterUri}
                                                className="w-24 h-36 rounded-2xl object-cover shadow-2xl border border-gray-800 group-hover:scale-105 transition-transform duration-500"
                                                alt={movie.title}
                                            />
                                        </div>

                                        <div className="flex-1 text-center md:text-left space-y-3">
                                            <div>
                                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight transition-colors">
                                                    {movie.title}
                                                </h3>
                                                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                                                    {movie.genres.map(g => (
                                                        <span key={g} className="text-[9px] bg-red-900/20 text-red-700 border border-red-900/30 px-3 py-1 rounded-lg font-black uppercase tracking-wider">
                                                        {g}
                                                    </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-center md:justify-start gap-4">
                                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest bg-gray-950 px-2 py-1 rounded">
                                                ID: {movie.id}
                                            </span>
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-xl text-[11px] font-black">
                                                    <Star size={12} fill="currentColor"/> {movie.rating?.toFixed(1) || "0.0"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-10 px-8 py-4 bg-gray-950/40 rounded-3xl border border-gray-800/30">
                                            <div className="text-center">
                                                <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Тривалість</p>
                                                <div className="flex items-center gap-2 text-gray-300 text-sm font-bold">
                                                    <Clock size={14} className="text-red-600"/> {movie.durationMin} хв
                                                </div>
                                            </div>
                                            <div className="w-px h-8 bg-gray-800"></div>
                                            <div className="text-center">
                                                <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Вартість</p>
                                                <div className="flex items-center gap-1.5 text-xl font-black text-green-500">
                                                    {movie.basePrice} <span className="text-xs font-bold text-green-700">₴</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleEditMovie(movie)}
                                                className="p-4 bg-gray-900 text-blue-500 rounded-2xl border border-gray-800 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 shadow-lg"
                                            >
                                                <Edit size={22}/>
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm({ isOpen: true, movieId: movie.id, movieTitle: movie.title })}
                                                className="p-4 bg-gray-900 text-red-500 rounded-2xl border border-gray-800 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 shadow-lg"
                                            >
                                                <Trash2 size={22}/>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 text-gray-500 font-medium text-xl">
                                    Нічого не знайдено за запитом "{debouncedSearch}"
                                </div>
                            )}
                        </div>

                        {!loading && totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pb-12 px-6">
                                <PaginationInfo
                                    currentPage={currentPage}
                                    pageSize={pageSize}
                                    totalCount={totalCount}
                                    itemName="фільм"
                                    className="text-xs"
                                />
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
                <div className="animate-fade-in pb-20">
                    <div className="flex items-center gap-6 mb-10">
                        <button onClick={() => setIsFormOpen(false)} className="bg-gray-800/50 p-4 rounded-2xl hover:bg-red-600 text-white transition-colors"><ArrowLeft size={24}/></button>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">{editingId ? `Редагування: ${watch('title')}` : 'Новий фільм'}</h2>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-10 items-start">
                        <aside className="lg:sticky lg:top-10 w-full lg:w-64 space-y-4">
                            <nav className="bg-[#1a1d26] p-6 rounded-[40px] border border-gray-800 shadow-xl">
                                {[{id: 'basic', label: 'Головне', icon: Info}, {id: 'media', label: 'Медіа & Дати', icon: PlayCircle}, {id: 'staff', label: 'Команда', icon: Users}, {id: 'tax', label: 'Жанри', icon: Hash}].map(item => (
                                    <button key={item.id} type="button" onClick={() => document.getElementById(item.id)?.scrollIntoView({behavior:'smooth', block:'start'})} className="w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-black text-gray-500 hover:text-white transition-all uppercase text-left group">
                                        <item.icon size={18} className="group-hover:text-red-600"/> {item.label}
                                    </button>
                                ))}
                            </nav>
                            <button type="button" onClick={(e) => void handleSubmit(onSubmit)(e)} className="w-full bg-red-600 text-white py-6 rounded-4xl font-black uppercase text-xs shadow-xl hover:bg-red-700 active:scale-95 transition-all"><Save size={20} className="inline mr-2"/> Зберегти</button>
                        </aside>

                        <div className="flex-1 space-y-10 w-full">
                            <form id="movieForm" className="space-y-10">
                                <FormSection id="basic" title="Головне" icon={Info} iconColor="text-red-600">
                                    <div className="space-y-6">
                                        <FormInput
                                            label="Назва фільму"
                                            {...register('title', {required: true})}
                                        />

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                            <FormInput label="Рейтинг" labelColor="text-yellow-500" type="number" step="0.1" {...register('rating')} />
                                            <FormInput label="Хвилини" labelColor="text-blue-400" type="number" {...register('durationMin')} />
                                            <FormInput label="Ціна (₴)" labelColor="text-green-500" type="number" {...register('basePrice')} />
                                        </div>

                                        <FormSelect label="Віковий ценз" {...register('ageRestriction')}>
                                            <option value={0}>0+</option>
                                            <option value={1}>12+</option>
                                            <option value={2}>16+</option>
                                            <option value={3}>18+</option>
                                        </FormSelect>

                                        <FormTextarea label="Опис сюжету" rows={5} {...register('description')} />
                                    </div>
                                </FormSection>

                                <FormSection id="media" title="Медіа" icon={Image} iconColor="text-blue-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <FormInput label="URL Постера" {...register('posterUri')} />
                                            <FormInput label="URL Трейлера" {...register('trailerUri')} />
                                        </div>

                                        <div className="bg-gray-900/40 p-6 rounded-3xl border border-gray-800 space-y-4 shadow-inner">
                                            <FormInput label="Прем'єра" type="date" {...register('releaseDate')} />
                                            <div className="grid grid-cols-2 gap-3">
                                                <FormInput label="Старт" labelColor="text-green-500" type="date" {...register('startDate')} />
                                                <FormInput label="Кінець" labelColor="text-red-500" type="date" {...register('endDate')} />
                                            </div>
                                        </div>
                                    </div>
                                </FormSection>

                                <FormSection id="staff" title="Команда" icon={Users} iconColor="text-purple-500">
                                    <SingleSelectGrid
                                        title="Режисер"
                                        items={directors}
                                        selectedId={selectedDirectorId}
                                        onSelect={(id) => setValue('directorId', id)}
                                        onAdd={() => setModal({ isOpen: true, type: 'directors', firstName: '', lastName: '', name: '', photoUri: '' })}
                                        renderLabel={(d) => `${d.firstName} ${d.lastName}`}
                                        accentColor="amber"
                                        searchPlaceholder="Знайти режисера..."
                                    />
                                    <MultipleSelectGrid
                                        title="Актори"
                                        icon={<Users size={20}/>}
                                        items={actors}
                                        selectedIds={selectedActorIds.map(Number)}
                                        onToggle={(id) => toggleSelection(id.toString(), 'actorIds')}
                                        onAdd={() => setModal({ isOpen: true, type: 'actors', firstName: '', lastName: '', name: '', photoUri: '' })}
                                        renderLabel={(a) => `${a.firstName} ${a.lastName}`}
                                        color="amber"
                                        itemsPerPage={6}
                                        searchPlaceholder="Знайти актора..."
                                    />
                                </FormSection>

                                <FormSection id="tax" title="Жанри" icon={Hash} iconColor="text-purple-500">
                                    <MultipleSelectGrid
                                        items={genres}
                                        selectedIds={selectedGenreIds.map(Number)}
                                        onToggle={(id) => toggleSelection(id.toString(), 'genreIds')}
                                        onAdd={() => setModal({ isOpen: true, type: 'genres', firstName: '', lastName: '', name: '', photoUri: '' })}
                                        renderLabel={(g) => g.name || ''}
                                        color="purple"
                                        itemsPerPage={8}
                                    />
                                </FormSection>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMovies;