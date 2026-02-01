import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axiosInstance';
import type { CreateMovieDto, Movie } from '../../types/movie';
import { Film, Image, Info, Search, Users, Edit, Trash2, ListFilter, X, Calendar, DollarSign, Clock, Plus, ArrowLeft, Save, Star } from 'lucide-react';

const AdminMovies = () => {
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateMovieDto>();
    const selectedDirectorId = watch('directorId');

    // --- СТЕЙТИ ---
    const [genres, setGenres] = useState<{id: number, name: string}[]>([]);
    const [directors, setDirectors] = useState<{id: number, firstName: string, lastName: string}[]>([]);
    const [actors, setActors] = useState<{id: number, firstName: string, lastName: string}[]>([]);
    const [languages, setLanguages] = useState<{id: number, name: string}[]>([]); // НОВЕ
    const [movies, setMovies] = useState<Movie[]>([]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Стейт пошуку
    const [directorSearch, setDirectorSearch] = useState('');
    const [actorSearch, setActorSearch] = useState('');
    const [genreSearch, setGenreSearch] = useState('');
    const [languageSearch, setLanguageSearch] = useState(''); // НОВЕ
    const [movieSearch, setMovieSearch] = useState('');

    const loadMovies = async () => {
        try {
            const res = await api.get<Movie[]>('/movies');
            setMovies(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Додано завантаження мов
                const [g, d, a, l] = await Promise.all([
                    api.get('/genres'),
                    api.get('/directors'),
                    api.get('/actors'),
                    api.get('/languages')
                ]);
                setGenres(g.data);
                setDirectors(d.data);
                setActors(a.data);
                setLanguages(l.data);
                loadMovies();
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, []);

    // --- ФІЛЬТРАЦІЯ ---
    const filteredDirectors = useMemo(() => directors.filter(d => `${d.firstName} ${d.lastName}`.toLowerCase().includes(directorSearch.toLowerCase())), [directors, directorSearch]);
    const filteredActors = useMemo(() => actors.filter(a => `${a.firstName} ${a.lastName}`.toLowerCase().includes(actorSearch.toLowerCase())), [actors, actorSearch]);
    const filteredGenres = useMemo(() => genres.filter(g => g.name.toLowerCase().includes(genreSearch.toLowerCase())), [genres, genreSearch]);
    const filteredLanguages = useMemo(() => languages.filter(l => l.name.toLowerCase().includes(languageSearch.toLowerCase())), [languages, languageSearch]);
    const filteredMovies = useMemo(() => movies.filter(m => m.title.toLowerCase().includes(movieSearch.toLowerCase())), [movies, movieSearch]);

    const openCreateForm = () => { setEditingId(null); reset(); setValue('directorId', undefined); setIsFormOpen(true); };
    const closeForm = () => { setEditingId(null); reset(); setIsFormOpen(false); };

    const handleEditMovie = (movie: Movie) => {
        setEditingId(movie.id);
        setValue('title', movie.title);
        setValue('description', movie.description || '');
        setValue('durationMin', movie.durationMin || 0);
        setValue('basePrice', movie.basePrice);
        setValue('posterUri', movie.posterUri || '');
        setValue('rating', movie.rating || 0);

        const ageMatch = movie.ageRestriction.match(/\d+/);
        setValue('ageRestriction', ageMatch ? parseInt(ageMatch[0]) : 0);

        const formatDate = (dateStr?: string) => dateStr ? dateStr.split('T')[0] : '';
        setValue('releaseDate', formatDate(movie.releaseDate));
        setValue('startDate', formatDate(movie.startDate));
        setValue('endDate', formatDate(movie.endDate));

        const foundDirector = directors.find(d => movie.directorName.includes(d.lastName));
        if (foundDirector) setValue('directorId', foundDirector.id);

        const foundGenreIds = genres.filter(g => movie.genres.includes(g.name)).map(g => g.id);
        setValue('genreIds', foundGenreIds);

        const foundActorIds = actors.filter(a => movie.actors.some(an => an.includes(a.lastName))).map(a => a.id);
        setValue('actorIds', foundActorIds);

        setIsFormOpen(true);
    };

    const onSubmit = async (data: any) => {
        try {
            const formattedData = {
                ...data,
                durationMin: Number(data.durationMin),
                basePrice: Number(data.basePrice),
                rating: Number(data.rating), // НОВЕ
                ageRestriction: Number(data.ageRestriction),
                directorId: data.directorId ? Number(data.directorId) : null,
                genreIds: data.genreIds ? data.genreIds.map(Number) : [],
                actorIds: data.actorIds ? data.actorIds.map(Number) : [],
                languageIds: data.languageIds ? data.languageIds.map(Number) : [], // НОВЕ
            };

            if (editingId) {
                await api.put(`/movies/${editingId}`, formattedData);
                alert(`Фільм оновлено!`);
            } else {
                await api.post('/movies', formattedData);
                alert('Фільм додано!');
            }
            loadMovies(); closeForm();
        } catch (err: any) {
            console.error(err);
            alert('Помилка: ' + (err.response?.data?.message || 'Щось пішло не так'));
        }
    };

    const handleDeleteMovie = async (id: number) => {
        if (window.confirm('Видалити цей фільм?')) {
            await api.delete(`/movies/${id}`);
            loadMovies();
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 text-white">
            {/* РЕЖИМ СПИСКУ (без змін) */}
            {!isFormOpen && (
                <div className="animate-fade-in">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <h2 className="text-3xl font-black flex items-center gap-3 tracking-tighter">
                            <Film className="text-red-600" size={32} /> КЕРУВАННЯ ФІЛЬМАМИ
                        </h2>
                        <button onClick={openCreateForm} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all transform hover:scale-105">
                            <Plus size={20} /> Додати новий фільм
                        </button>
                    </div>

                    <div className="bg-[#1a1d26] rounded-[32px] border border-gray-800 shadow-2xl overflow-hidden">
                        {/* ... таблиця ... */}
                        <div className="p-6 border-b border-gray-800 bg-gray-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <ListFilter className="text-gray-400" size={20} />
                                <h3 className="font-bold text-gray-200">Всього фільмів: {filteredMovies.length}</h3>
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input type="text" placeholder="Пошук фільму..." value={movieSearch} onChange={(e) => setMovieSearch(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-12 pr-10 outline-none focus:border-red-500 text-sm transition-all" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                <tr className="text-left bg-gray-900/50 text-[10px] uppercase tracking-[0.2em] text-gray-500">
                                    <th className="p-5 w-24">Постер</th>
                                    <th className="p-5">Інформація</th>
                                    <th className="p-5 hidden md:table-cell">Жанри</th>
                                    <th className="p-5 hidden sm:table-cell">Деталі</th>
                                    <th className="p-5 text-right">Дії</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                {filteredMovies.map(movie => (
                                    <tr key={movie.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 text-center">
                                            <div className="w-16 h-24 rounded-xl bg-gray-800 border border-gray-700 overflow-hidden shadow-lg mx-auto">
                                                {movie.posterUri ? <img src={movie.posterUri} alt="" className="w-full h-full object-cover" /> : <Film className="text-gray-600 m-auto mt-8" />}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-lg text-white mb-1 line-clamp-1">{movie.title}</div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">ID: {movie.id}</div>

                                                {/* ВИПРАВЛЕНИЙ БЛОК РЕЙТИНГУ */}
                                                <div className="flex items-center gap-1 text-yellow-500 text-xs font-black bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/20">
                                                    <Star size={12} fill="currentColor" />
                                                    <span>{movie.rating !== undefined && movie.rating !== null ? movie.rating.toFixed(1) : "0.0"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <div className="flex flex-wrap gap-1">
                                                {movie.genres.map(g => <span key={g} className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-400 border border-gray-700/50">{g}</span>)}
                                            </div>
                                        </td>
                                        <td className="p-4 hidden sm:table-cell text-sm text-gray-400">
                                            <div className="flex items-center gap-2 mb-1"><Clock size={14}/> {movie.durationMin} хв</div>
                                            <div className="flex items-center gap-2 text-white font-bold"><DollarSign size={14} className="text-green-500"/> {movie.basePrice} ₴</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEditMovie(movie)} className="p-3 bg-gray-800 hover:bg-blue-600 hover:text-white text-blue-500 rounded-xl transition-all"><Edit size={18} /></button>
                                                <button onClick={() => handleDeleteMovie(movie.id)} className="p-3 bg-gray-800 hover:bg-red-600 hover:text-white text-red-500 rounded-xl transition-all"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* РЕЖИМ ФОРМИ */}
            {isFormOpen && (
                <div className="animate-fade-in-up">
                    <div className="flex items-center justify-between mb-8">
                        <button onClick={closeForm} className="flex items-center gap-2 text-gray-400 hover:text-white transition font-bold uppercase tracking-widest text-xs">
                            <ArrowLeft size={16} /> Назад до списку
                        </button>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">
                            {editingId ? `Редагування: ID ${editingId}` : 'Новий фільм'}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-8 ${editingId ? 'ring-2 ring-yellow-500/50 rounded-[40px] p-2' : ''}`}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* ЛІВА КОЛОНКА */}
                            <div className="bg-[#1a1d26] p-8 rounded-[32px] border border-gray-800 shadow-2xl space-y-6">
                                <div className="flex items-center gap-2 text-red-500 mb-2">
                                    <Info size={18} />
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em]">Основна інформація</h3>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-2 ml-1 uppercase tracking-wider">Назва фільму</label>
                                    <input {...register('title', { required: true })} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-500 text-white transition-all shadow-inner placeholder-gray-600" placeholder="Введіть назву..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 font-bold mb-2 ml-1 uppercase tracking-wider">Віковий ценз</label>
                                        <select {...register('ageRestriction')} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-500 text-white shadow-inner cursor-pointer appearance-none">
                                            <option value="0">0+ (G)</option>
                                            <option value="12">12+ (PG-13)</option>
                                            <option value="16">16+ (R)</option>
                                            <option value="18">18+ (NC-17)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 font-bold mb-2 ml-1 uppercase tracking-wider flex items-center gap-1"><Star size={12} className="text-yellow-500"/> Рейтинг (0-10)</label>
                                        <input {...register('rating', { required: true })} type="number" step="0.1" min="0" max="10" className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-500 text-white shadow-inner" placeholder="8.5" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 font-bold mb-2 ml-1 uppercase tracking-wider flex items-center gap-1"><Clock size={12}/> Тривалість (хв)</label>
                                        <input {...register('durationMin', { required: true })} type="number" className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-500 text-white shadow-inner" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 font-bold mb-2 ml-1 uppercase tracking-wider flex items-center gap-1"><DollarSign size={12}/> Ціна (грн)</label>
                                        <input {...register('basePrice', { required: true })} type="number" step="0.01" className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-500 text-white shadow-inner" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-2 ml-1 uppercase tracking-wider">Опис</label>
                                    <textarea {...register('description')} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl h-32 outline-none focus:border-red-500 text-white resize-none shadow-inner placeholder-gray-600" placeholder="Сюжет..." />
                                </div>
                            </div>

                            {/* ПРАВА КОЛОНКА */}
                            <div className="bg-[#1a1d26] p-8 rounded-[32px] border border-gray-800 shadow-2xl space-y-6 flex flex-col">
                                <div className="flex items-center gap-2 text-red-500 mb-2">
                                    <Image size={18} />
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em]">Медіа та Дати</h3>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-2 ml-1 uppercase tracking-wider">URL Постера</label>
                                    <input {...register('posterUri')} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-500 text-white shadow-inner placeholder-gray-600" placeholder="https://..." />
                                </div>
                                <div className="grid grid-cols-1 gap-4 p-5 bg-gray-900 rounded-3xl border border-gray-800 shadow-inner">
                                    <div>
                                        <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider flex items-center gap-2"><Calendar size={12}/> Дата прем'єри</label>
                                        <input {...register('releaseDate', { required: true })} type="date" className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl outline-none focus:border-red-500 text-white" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider text-green-500 flex items-center gap-2"><Calendar size={12}/> Початок прокату</label>
                                            <input {...register('startDate', { required: true })} type="date" className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl outline-none focus:border-red-500 text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider text-red-500 flex items-center gap-2"><Calendar size={12}/> Кінець прокату</label>
                                            <input {...register('endDate', { required: true })} type="date" className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl outline-none focus:border-red-500 text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <label className="block text-xs text-gray-500 font-bold mb-2 ml-1 uppercase tracking-wider flex items-center gap-2"><Users size={14}/> Режисер</label>
                                    <div className="relative mb-2">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input type="text" placeholder="Знайти..." className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs outline-none focus:border-red-500 text-white placeholder-gray-600" value={directorSearch} onChange={(e) => setDirectorSearch(e.target.value)} />
                                    </div>
                                    <div className="w-full bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden h-[150px] overflow-y-auto custom-scrollbar">
                                        {filteredDirectors.map(d => (
                                            <button key={d.id} type="button" onClick={() => setValue('directorId', d.id)} className={`w-full text-left p-3 text-xs font-bold transition-all border-b border-gray-800 last:border-0 flex justify-between items-center ${selectedDirectorId === d.id ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                                                <span>{d.firstName.toUpperCase()} {d.lastName.toUpperCase()}</span>
                                                {selectedDirectorId === d.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                            </button>
                                        ))}
                                    </div>
                                    <input type="hidden" {...register('directorId', { required: true })} />
                                </div>
                            </div>
                        </div>

                        {/* ЖАНРИ, АКТОРИ ТА МОВИ */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Жанри */}
                            <div className="bg-[#1a1d26] p-6 rounded-[32px] border border-gray-800 shadow-2xl flex flex-col h-[350px]">
                                <div className="flex justify-between mb-4 items-center">
                                    <h3 className="text-xs font-black uppercase text-red-500">Жанри</h3>
                                    <input type="text" placeholder="Шукати..." className="w-24 pl-2 py-1 bg-gray-900 border border-gray-700 rounded-lg text-[10px] outline-none text-white focus:border-red-500" value={genreSearch} onChange={(e) => setGenreSearch(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-2 custom-scrollbar">
                                    {filteredGenres.map(genre => (
                                        <label key={genre.id} className="flex items-center gap-3 bg-gray-900 p-2 rounded-xl border border-gray-800 cursor-pointer hover:border-red-500/50 transition-all group">
                                            <input type="checkbox" value={genre.id} {...register('genreIds')} className="w-4 h-4 accent-red-600 rounded cursor-pointer" />
                                            <span className="text-[10px] text-gray-300 uppercase font-black group-hover:text-white select-none">{genre.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Актори */}
                            <div className="bg-[#1a1d26] p-6 rounded-[32px] border border-gray-800 shadow-2xl flex flex-col h-[350px]">
                                <div className="flex justify-between mb-4 items-center">
                                    <h3 className="text-xs font-black uppercase text-red-500">Актори</h3>
                                    <input type="text" placeholder="Шукати..." className="w-24 pl-2 py-1 bg-gray-900 border border-gray-700 rounded-lg text-[10px] outline-none text-white focus:border-red-500" value={actorSearch} onChange={(e) => setActorSearch(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-2 custom-scrollbar">
                                    {filteredActors.map(actor => (
                                        <label key={actor.id} className="flex items-center gap-3 bg-gray-900 p-2 rounded-xl border border-gray-800 cursor-pointer hover:border-red-500/50 transition-all group">
                                            <input type="checkbox" value={actor.id} {...register('actorIds')} className="w-4 h-4 accent-red-600 rounded cursor-pointer" />
                                            <span className="text-[10px] text-gray-300 uppercase font-black group-hover:text-white select-none">{actor.firstName} {actor.lastName}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Мови - НОВЕ */}
                            <div className="bg-[#1a1d26] p-6 rounded-[32px] border border-gray-800 shadow-2xl flex flex-col h-[350px]">
                                <div className="flex justify-between mb-4 items-center">
                                    <h3 className="text-xs font-black uppercase text-red-500">Мови</h3>
                                    <input type="text" placeholder="Шукати..." className="w-24 pl-2 py-1 bg-gray-900 border border-gray-700 rounded-lg text-[10px] outline-none text-white focus:border-red-500" value={languageSearch} onChange={(e) => setLanguageSearch(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-2 custom-scrollbar">
                                    {filteredLanguages.map(lang => (
                                        <label key={lang.id} className="flex items-center gap-3 bg-gray-900 p-2 rounded-xl border border-gray-800 cursor-pointer hover:border-red-500/50 transition-all group">
                                            <input type="checkbox" value={lang.id} {...register('languageIds')} className="w-4 h-4 accent-red-600 rounded cursor-pointer" />
                                            <span className="text-[10px] text-gray-300 uppercase font-black group-hover:text-white select-none">{lang.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-gray-800">
                            <button type="button" onClick={closeForm} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-2xl font-bold transition-all uppercase tracking-wider text-xs">Скасувати</button>
                            <button type="submit" className={`flex-[2] text-white font-black py-4 rounded-2xl transition-all shadow-xl uppercase tracking-widest flex items-center justify-center gap-2 ${editingId ? 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-600/30' : 'bg-red-600 hover:bg-red-700 shadow-red-600/30'}`}>
                                <Save size={20} /> {editingId ? 'Зберегти зміни' : 'Створити фільм'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminMovies;