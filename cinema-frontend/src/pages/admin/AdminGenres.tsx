import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axiosInstance';
import type { CreateGenreDto, GenreDto } from '../../types/genre';
import { Tag, Trash2, Search, Plus, ListFilter, X, Loader2 } from 'lucide-react';

const AdminGenres = () => {
    const { register, handleSubmit, reset } = useForm<CreateGenreDto>();

    const [genres, setGenres] = useState<GenreDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const loadGenres = async () => {
        try {
            const res = await api.get<GenreDto[]>('/genres');
            setGenres(res.data);
        } catch (err) {
            console.error("Не вдалося завантажити жанри", err);
        }
    };

    useEffect(() => {
        loadGenres();
    }, []);

    const onSubmit = async (data: CreateGenreDto) => {
        setLoading(true);
        try {
            await api.post('/genres', data);
            reset();
            loadGenres();
        } catch (err: any) {
            alert('Помилка: ' + (err.response?.data?.message || 'Не вдалося додати жанр'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Ви впевнені? Цей жанр зникне з усіх фільмів.')) return;
        try {
            await api.delete(`/genres/${id}`);
            loadGenres();
        } catch (err) {
            alert('Помилка при видаленні.');
        }
    };

    const filteredGenres = useMemo(() => {
        return genres.filter(g =>
            g.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [genres, searchTerm]);

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start text-white animate-fade-in">

            {/* ЛІВА ЧАСТИНА: Форма */}
            <div className="w-full lg:w-1/3 lg:sticky lg:top-0 bg-[#1a1d26] p-8 rounded-[32px] border border-gray-800 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-red-600/20 p-2 rounded-lg">
                        <Plus className="text-red-600" size={24} />
                    </div>
                    <h2 className="text-xl font-black tracking-tight uppercase">Новий жанр</h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="text-[10px] font-black text-gray-500 mb-2 block tracking-widest uppercase">Назва жанру</label>
                        <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                {...register('name', { required: true })}
                                className="w-full p-4 pl-12 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-500 transition-all text-sm"
                                placeholder="Напр. Комедія"
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 uppercase tracking-widest text-xs mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin mx-auto"/> : 'Додати жанр'}
                    </button>
                </form>
            </div>

            <div className="w-full lg:w-2/3 bg-[#1a1d26] rounded-[32px] border border-gray-800 shadow-2xl overflow-hidden flex flex-col">
                {/* Панель пошуку */}
                <div className="p-6 border-b border-gray-800 bg-gray-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <ListFilter className="text-red-600" size={20} />
                        <h2 className="font-bold">Усі жанри</h2>
                        <span className="bg-gray-800 text-gray-400 px-2.5 py-0.5 rounded-full text-xs font-bold">
                            {genres.length}
                        </span>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Пошук жанру..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2.5 pl-11 pr-10 outline-none focus:border-red-500 text-sm transition-all"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Таблиця */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="text-left bg-gray-900/50 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            <th className="p-5 w-24">Іконка</th>
                            <th className="p-5">Назва</th>
                            <th className="p-5 text-right">Керування</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                        {filteredGenres.map(genre => (
                            <tr key={genre.id} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="p-4 w-20">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center shadow-inner group-hover:border-gray-600 transition-colors">
                                        <Tag size={20} className="text-gray-500 group-hover:text-red-500 transition-colors" />
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-gray-100 uppercase tracking-wide">{genre.name}</div>
                                    <div className="text-[10px] text-gray-500 font-mono mt-0.5 uppercase tracking-tighter">System ID: {genre.id}</div>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleDelete(genre.id)}
                                        className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                        title="Видалити запис"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* Порожній стан */}
                    {filteredGenres.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-600 bg-gray-900/10">
                            <Tag size={48} className="mb-4 opacity-10" />
                            <p className="font-medium">Жанрів не знайдено</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminGenres;