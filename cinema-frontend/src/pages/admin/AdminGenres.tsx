import { useEffect, useState, useMemo } from 'react';
import api from '../../api/axiosInstance';
import type { CreateGenreDto, GenreDto } from '../../types/genre';
import {Tag, Trash2, Search, ListFilter, X, Plus} from 'lucide-react';
import { notify } from "../../utils/toast.ts";
import { CreateCard } from "../../components/CreateCard.tsx";
import {ConfirmModal} from "../../components/ui/ConfirmModal.tsx";

const AdminGenres = () => {
    const [genres, setGenres] = useState<GenreDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        id: null as number | null,
        name: ''
    });
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleCreateSubmit = async (data: CreateGenreDto) => {
        setLoading(true);
        try {
            await api.post('/genres', data);
            notify.success('Жанр додано!');
            await loadGenres();
        } catch (err: any) {
            notify.error('Помилка: ' + (err.response?.data?.message || 'Не вдалося додати жанр'));
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: number, name: string) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.id) return;

        setIsDeleting(true);
        try {
            await api.delete(`/genres/${deleteModal.id}`);
            notify.success('Жанр видалено');
            await loadGenres();
            setDeleteModal({ isOpen: false, id: null, name: '' });
        } catch (err) {
            notify.error('Помилка при видаленні.');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredGenres = useMemo(() => {
        return genres.filter(g =>
            g.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [genres, searchTerm]);

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start text-white animate-fade-in">
            <CreateCard
                title="Новий жанр"
                buttonText="Додати жанр"
                icon={Plus}
                loading={loading}
                onSubmit={handleCreateSubmit}
                fields={[
                    {
                        name: 'name',
                        label: "Назва",
                        placeholder: "Напр. Драма",
                        icon: Plus,
                        required: true
                    }
                ]}
            />

            <div className="w-full lg:w-2/3 bg-[#1a1d26] rounded-4xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col">
                {/* Панель пошуку */}
                <div className="p-6 border-b border-gray-800 bg-gray-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <ListFilter className="text-red-600" size={20} />
                        <h2 className="font-bold uppercase tracking-tight text-sm">Усі жанри</h2>
                        <span className="bg-gray-800 text-gray-400 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                            {genres.length}
                        </span>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Швидкий пошук..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 pl-11 pr-10 outline-none focus:border-red-500 text-xs transition-all"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Таблиця */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="text-left bg-gray-950 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            <th className="p-5 w-24">Тег</th>
                            <th className="p-5">Назва</th>
                            <th className="p-5 text-right px-8">Дії</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                        {filteredGenres.map(genre => (
                            <tr key={genre.id} className="group hover:bg-white/2 transition-colors">
                                <td className="p-4 pl-6">
                                    <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:border-red-500/30 transition-colors">
                                        <Tag size={16} className="text-gray-500 group-hover:text-red-500 transition-colors" />
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-gray-100 uppercase text-xs tracking-wider">{genre.name}</div>
                                    <div className="text-[9px] text-gray-600 font-mono mt-0.5 uppercase">ID: {genre.id}</div>
                                </td>
                                <td className="p-4 text-right px-8">
                                    <button
                                        onClick={() => handleDeleteClick(genre.id, genre.name)}
                                        className="p-2.5 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {filteredGenres.length === 0 && (
                        <div className="py-16 flex flex-col items-center justify-center text-gray-600">
                            <Tag size={40} className="mb-3 opacity-10" />
                            <p className="text-xs font-black uppercase tracking-widest">Нічого не знайдено</p>
                        </div>
                    )}
                </div>
            </div>
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Видалити жанр?"
                description={
                    <>
                        Ви впевнені, що хочете видалити жанр <span className="text-white font-bold">"{deleteModal.name}"</span>?
                        Він зникне з усіх прив'язаних фільмів.
                    </>
                }
                confirmText="Так, видалити"
                cancelText="Скасувати"
                isLoading={isDeleting}
                onConfirm={handleConfirmDelete}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
            />
        </div>
    );
};

export default AdminGenres;