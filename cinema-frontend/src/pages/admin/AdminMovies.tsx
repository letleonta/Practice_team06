import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axiosInstance';
import { MovieService } from '../../services/movie.service';
import type { CreateMovieDto, MovieDto } from '../../types/movie';
import {
    Film, Search, Edit, Trash2, Clock, Plus,
    ArrowLeft, Save, Star, PlayCircle, Info, Image, Users,
    ChevronLeft, ChevronRight, Hash, X
} from 'lucide-react';
import {ConfirmModal} from "../../components/ui/ConfirmModal.tsx";
import {notify} from "../../utils/toast";

// Локальні інтерфейси для типізації
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
    const [movies, setMovies] = useState<MovieDto[]>([]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [movieSearch, setMovieSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [searchTerms, setSearchTerms] = useState({ director: '', actor: '', genre: '' });
    const [pages, setPages] = useState({ director: 1, actor: 1, genre: 1 });
    const innerItemsPerPage = 6;

    const [modal, setModal] = useState({ isOpen: false, type: '', firstName: '', lastName: '', name: '', photoUri: '' });
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, movieId: number | null, movieTitle: string }>({
        isOpen: false, movieId: null, movieTitle: ''
    });

    const fetchData = async () => {
        try {
            const [g, d, a, m] = await Promise.all([
                api.get('/genres'), api.get('/directors'),
                api.get('/actors'), MovieService.getAll()
            ]);
            setGenres(g.data); setDirectors(d.data);
            setActors(a.data); setMovies(m);
        } catch (_err) { console.error("Error loading data"); }
    };

    useEffect(() => { void fetchData(); }, []);

    const toggleSelection = (id: string, field: 'genreIds' | 'actorIds') => {
        const currentValues: string[] = (watch(field) as unknown as string[]) || [];
        const newValues = currentValues.includes(id)
            ? currentValues.filter(v => v !== id)
            : [...currentValues, id];
        setValue(field, newValues as any);
    };

    const handlePageChange = (key: keyof typeof pages, direction: number) => {
        setPages(prev => ({ ...prev, [key]: prev[key] + direction }));
    };

    const handleSearchChange = (key: keyof typeof searchTerms, value: string) => {
        setSearchTerms(prev => ({ ...prev, [key]: value }));
        setPages(prev => ({ ...prev, [key]: 1 }));
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

    const getPaginatedData = <T extends NamedEntity | PersonEntity>(data: T[], term: string, pageKey: keyof typeof pages) => {
        const filtered = data.filter(item => {
            const fullName = 'name' in item ? item.name : `${item.firstName} ${item.lastName}`;
            return fullName.toLowerCase().includes(term.toLowerCase());
        });
        const total = Math.ceil(filtered.length / innerItemsPerPage);
        const paginated = filtered.slice((pages[pageKey] - 1) * innerItemsPerPage, pages[pageKey] * innerItemsPerPage);
        return { data: paginated, total };
    };

    const filteredMovies = movies.filter(m => m.title.toLowerCase().includes(movieSearch.toLowerCase()));
    const totalMainPages = Math.ceil(filteredMovies.length / 8);
    const currentMovies = filteredMovies.slice((currentPage - 1) * 8, currentPage * 8);

    const MiniPagination = ({ current, total, onPrev, onNext }: { current: number, total: number, onPrev: () => void, onNext: () => void }) => {
        if (total <= 1) return null;
        return (
            <div className="flex items-center gap-2 pt-4">
                <button type="button" onClick={onPrev} disabled={current === 1} className="p-1.5 bg-gray-900 rounded-lg disabled:opacity-20 hover:bg-gray-800 transition-colors"><ChevronLeft size={14}/></button>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Стор. {current}</span>
                <button type="button" onClick={onNext} disabled={current === total} className="p-1.5 bg-gray-900 rounded-lg disabled:opacity-20 hover:bg-gray-800 transition-colors"><ChevronRight size={14}/></button>
            </div>
        );
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
                /* ІНТЕРФЕЙС СПИСКУ */
                <div className="animate-fade-in">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                        <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-4">
                            <Film className="text-red-600" size={36}/>
                            КЕРУВАННЯ ФІЛЬМАМИ
                        </h2>
                        <button
                            onClick={() => { setEditingId(null); reset(); setIsFormOpen(true); }}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-red-600/20 transition-all active:scale-95"
                        >
                            + Додати новий фільм
                        </button>
                    </div>

                    <div className="bg-[#1a1d26]/60 rounded-[40px] border border-gray-800 shadow-2xl backdrop-blur-md overflow-hidden">
                        <div className="p-8 border-b border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="px-4 py-2 bg-gray-900/80 rounded-full border border-gray-800 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                                    Всього у базі: {filteredMovies.length}
                                </div>
                            </div>
                            <div className="relative w-full md:w-100">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
                                <input
                                    type="text"
                                    placeholder="Пошук фільму..."
                                    value={movieSearch}
                                    onChange={e => {setMovieSearch(e.target.value); setCurrentPage(1);}}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/20 transition-all font-bold text-white placeholder:text-gray-600 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="p-4 space-y-3">
                            {currentMovies.map(movie => (
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
                            ))}
                        </div>

                        {totalMainPages > 1 && (
                            <div className="p-10 border-t border-gray-800/50 flex justify-center items-center gap-3">
                                {[...Array(totalMainPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-12 h-12 rounded-2xl font-black text-xs transition-all duration-300 ${
                                            currentPage === i + 1
                                                ? 'bg-red-600 text-white shadow-xl shadow-red-600/30 scale-110'
                                                : 'bg-gray-900 text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* --- ФОРМА --- */
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
                                <section id="basic" className="bg-[#1a1d26] p-10 rounded-[40px] border border-gray-800 shadow-2xl space-y-8 scroll-mt-10">
                                    <h3 className="text-white font-black uppercase flex items-center gap-3 border-b border-gray-800 pb-8"><Info className="text-red-600"/> Головне</h3>
                                    <div className="space-y-6">
                                        <div><label className="text-[10px] text-gray-500 font-black uppercase mb-3 block">Назва фільму</label><input {...register('title', {required: true})} className="w-full bg-gray-900 border border-gray-700 p-5 rounded-2xl outline-none focus:border-red-600 text-white font-bold text-lg shadow-inner"/></div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                            <div><label className="text-[10px] text-yellow-500 font-black mb-3 block uppercase">Рейтинг</label><input type="number" step="0.1" {...register('rating')} className="w-full bg-gray-900 border border-gray-700 p-5 rounded-2xl outline-none text-white font-black shadow-inner"/></div>
                                            <div><label className="text-[10px] text-blue-400 font-black mb-3 block uppercase">Хвилини</label><input type="number" {...register('durationMin')} className="w-full bg-gray-900 border border-gray-700 p-5 rounded-2xl outline-none text-white font-black shadow-inner"/></div>
                                            <div><label className="text-[10px] text-green-500 font-black mb-3 block uppercase">Ціна (₴)</label><input type="number" {...register('basePrice')} className="w-full bg-gray-900 border border-gray-700 p-5 rounded-2xl outline-none text-white font-black shadow-inner"/></div>
                                        </div>
                                        <div><label className="text-[10px] text-gray-500 font-black mb-3 block uppercase">Віковий ценз</label>
                                            <select {...register('ageRestriction')} className="w-full bg-gray-900 border border-gray-700 p-5 rounded-2xl outline-none text-white font-black uppercase text-xs cursor-pointer shadow-inner">
                                                <option value={0}>0+ </option><option value={1}>12+ </option><option value={2}>16+ </option><option value={3}>18+ </option>
                                            </select>
                                        </div>
                                        <div><label className="text-[10px] text-gray-500 font-black mb-3 block uppercase">Опис сюжету</label><textarea {...register('description')} rows={5} className="w-full bg-gray-900 border border-gray-700 p-6 rounded-3xl outline-none focus:border-red-600 text-gray-300 resize-none font-medium leading-relaxed shadow-inner"/></div>
                                    </div>
                                </section>

                                <section id="media" className="bg-[#1a1d26] p-10 rounded-[40px] border border-gray-800 shadow-2xl space-y-8 scroll-mt-10">
                                    <h3 className="text-white font-black uppercase flex items-center gap-3 border-b border-gray-800 pb-8"><Image className="text-blue-500"/> Медіа</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div><label className="text-[10px] text-gray-500 font-black uppercase mb-3 block tracking-widest leading-none">URL Постера</label><input {...register('posterUri')} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-2xl outline-none text-white font-mono text-xs shadow-inner"/></div>
                                            <div><label className="text-[10px] text-gray-500 font-black uppercase mb-3 block tracking-widest leading-none">URL Трейлера</label><input {...register('trailerUri')} className="w-full bg-gray-900 border border-gray-700 p-4 rounded-2xl outline-none text-white font-mono text-xs shadow-inner"/></div>
                                        </div>
                                        <div className="bg-gray-900/40 p-6 rounded-3xl border border-gray-800 space-y-4 shadow-inner">
                                            <div><label className="text-[10px] text-gray-400 font-black uppercase block mb-1 tracking-widest leading-none">Прем'єра</label><input type="date" {...register('releaseDate')} className="w-full bg-gray-900 border border-gray-800 p-3 rounded-xl outline-none text-white font-black shadow-inner"/></div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div><label className="text-[10px] text-green-500 font-black block mb-1 uppercase tracking-widest leading-none">Старт</label><input type="date" {...register('startDate')} className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl outline-none text-white shadow-inner"/></div>
                                                <div><label className="text-[10px] text-red-500 font-black block mb-1 uppercase tracking-widest leading-none">Кінець</label><input type="date" {...register('endDate')} className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl outline-none text-white shadow-inner"/></div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section id="staff" className="bg-[#1a1d26] p-10 rounded-[40px] border border-gray-800 shadow-2xl space-y-10 scroll-mt-10">
                                    <h3 className="text-white font-black uppercase flex items-center gap-3 border-b border-gray-800 pb-8 tracking-widest"><Users className="text-amber-500"/> Команда</h3>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end gap-4">
                                            <div className="flex-1">
                                                <label className="text-[10px] text-gray-500 font-black uppercase mb-3 block tracking-widest leading-none">Режисер</label>
                                                <div className="relative"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"/><input type="text" placeholder="Пошук..." value={searchTerms.director} onChange={(e) => handleSearchChange('director', e.target.value)} className="w-full bg-gray-900 border border-gray-700 pl-12 pr-4 py-4 rounded-2xl text-xs outline-none focus:border-amber-500 text-white font-bold shadow-inner"/></div>
                                            </div>
                                            <button type="button" onClick={() => setModal({ isOpen: true, type: 'directors', firstName: '', lastName: '', name: '', photoUri: '' })} className="text-[10px] bg-amber-500 text-white px-6 py-4 rounded-2xl font-black hover:bg-amber-600 transition-all">+ Додати</button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {getPaginatedData(directors, searchTerms.director, 'director').data.map(d => (
                                                <button key={d.id} type="button" onClick={() => setValue('directorId', d.id)} className={`p-5 rounded-3xl border text-[11px] font-black uppercase transition-all ${selectedDirectorId === d.id ? 'bg-amber-600 border-amber-500 text-white shadow-xl shadow-amber-600/20' : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600'}`}>{d.firstName} {d.lastName}</button>
                                            ))}
                                        </div>
                                        <MiniPagination current={pages.director} total={getPaginatedData(directors, searchTerms.director, 'director').total} onPrev={() => handlePageChange('director', -1)} onNext={() => handlePageChange('director', 1)}/>
                                    </div>
                                    <div className="pt-10 border-t border-gray-800 space-y-6">
                                        <div className="flex justify-between items-end gap-4">
                                            <div className="flex-1">
                                                <label className="text-[10px] text-gray-500 font-black uppercase mb-3 block tracking-widest leading-none">Актори</label>
                                                <div className="relative"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"/><input type="text" placeholder="Знайти актора..." value={searchTerms.actor} onChange={(e) => handleSearchChange('actor', e.target.value)} className="w-full bg-gray-900 border border-gray-700 pl-12 pr-4 py-4 rounded-2xl text-xs outline-none focus:border-amber-500 text-white font-bold shadow-inner"/></div>
                                            </div>
                                            <button type="button" onClick={() => setModal({ isOpen: true, type: 'actors', firstName: '', lastName: '', name: '', photoUri: '' })} className="text-[10px] bg-amber-500 text-white px-6 py-4 rounded-2xl font-black hover:bg-amber-600 transition-all">+ Додати</button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {getPaginatedData(actors, searchTerms.actor, 'actor').data.map(a => {
                                                const isChecked = selectedActorIds.includes(a.id.toString());
                                                return (
                                                    <label
                                                        key={a.id}
                                                        className={`flex items-center gap-4 p-5 rounded-3xl border transition-all cursor-pointer group ${isChecked ? 'bg-amber-600 border-amber-500 shadow-lg shadow-amber-600/10' : 'bg-gray-900 border-gray-800'}`}
                                                        onClick={() => toggleSelection(a.id.toString(), 'actorIds')}
                                                    >
                                                        <input type="checkbox" checked={isChecked} readOnly className="w-5 h-5 accent-amber-600 rounded cursor-pointer" />
                                                        <span className={`text-[11px] font-black uppercase ${isChecked ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>{a.firstName} {a.lastName}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        <MiniPagination current={pages.actor} total={getPaginatedData(actors, searchTerms.actor, 'actor').total} onPrev={() => handlePageChange('actor', -1)} onNext={() => handlePageChange('actor', 1)}/>
                                    </div>
                                </section>

                                <section id="tax" className="bg-[#1a1d26] p-10 rounded-[40px] border border-gray-800 shadow-2xl space-y-10 scroll-mt-10 mb-20">
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-end gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-purple-500 font-black uppercase text-xs flex items-center gap-3 mb-4 tracking-widest leading-none"><Hash size={20}/> Жанри</h3>
                                                <div className="relative"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700"/><input type="text" placeholder="Пошук жанру..." value={searchTerms.genre} onChange={(e) => handleSearchChange('genre', e.target.value)} className="w-full bg-gray-900 border border-gray-700 pl-12 pr-4 py-4 rounded-2xl text-xs outline-none focus:border-purple-500 text-white font-bold shadow-inner"/></div>
                                            </div>
                                            <button type="button" onClick={() => setModal({ isOpen: true, type: 'genres', firstName: '', lastName: '', name: '', photoUri: '' })} className="p-4 bg-purple-500 text-white rounded-2xl hover:bg-purple-600 shadow-lg shadow-purple-500/10 transition-all"><Plus size={18}/></button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {getPaginatedData(genres, searchTerms.genre, 'genre').data.map(g => {
                                                const isChecked = selectedGenreIds.includes(g.id.toString());
                                                return (
                                                    <label
                                                        key={g.id}
                                                        className={`flex items-center gap-4 p-5 rounded-3xl border transition-all cursor-pointer group ${isChecked ? 'bg-purple-600 border-purple-500 shadow-lg shadow-purple-600/10' : 'bg-gray-900 border-gray-800'}`}
                                                        onClick={() => toggleSelection(g.id.toString(), 'genreIds')}
                                                    >
                                                        <input type="checkbox" checked={isChecked} readOnly className="w-5 h-5 accent-purple-600 rounded cursor-pointer" />
                                                        <span className={`text-[11px] font-black uppercase tracking-tight ${isChecked ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>{g.name}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        <MiniPagination current={pages.genre} total={getPaginatedData(genres, searchTerms.genre, 'genre').total} onPrev={() => handlePageChange('genre', -1)} onNext={() => handlePageChange('genre', 1)}/>
                                    </div>
                                </section>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMovies;
