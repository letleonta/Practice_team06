import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Plus,
    Trash2,
    Search,
    Loader2,
    Tag,
    Pencil,
    Check,
    X
} from 'lucide-react';

import { GenreService } from '../../services/genre.service';
import type { CreateGenreDto, GenreDto, GenreFilterDto } from '../../types/genre';
import { UsePagination } from "../../hooks/UsePagination";
import { Pagination } from "../../components/Pagination";
import { PaginationInfo } from "../../components/PaginationInfo";
import { DataTable, type Column } from "../../components/DataTable";
import { notify } from "../../utils/toast";

const AdminGenres = () => {
    // Форма для редагування (у попапі або режимі редагування)
    const { register, handleSubmit, reset, setValue } = useForm<CreateGenreDto>();
    // Форма для додавання (зліва)
    const addForm = useForm<CreateGenreDto>();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'id' | 'name'>('id');
    const [isDesc, setIsDesc] = useState(false); // За замовчуванням false, щоб сортування було зрозумілим
    const [isSaving, setIsSaving] = useState(false);

    // Стан для редагування
    const [editingGenre, setEditingGenre] = useState<GenreDto | null>(null);

    const fetchGenres = async (page: number, pageSize: number) => {
        const filter: GenreFilterDto = {
            search: searchTerm || undefined,
            sortBy: sortBy,
            isDescending: isDesc,
            Page: page,
            PageSize: pageSize,
        };
        return await GenreService.getAll(filter);
    };

    const {
        items: genres,
        totalCount,
        currentPage,
        totalPages,
        pageSize,
        loading,
        error,
        goToPage,
        refresh,
    } = UsePagination(
        fetchGenres,
        [searchTerm, sortBy, isDesc],
        { pageSize: 8 }
    );

    // Створення нового жанру
    const onAddSubmit = async (data: CreateGenreDto) => {
        setIsSaving(true);
        try {
            await GenreService.create(data);
            notify.success("Жанр додано");
            addForm.reset();
            refresh();
        } catch (err: unknown) {
            console.error(err);
            notify.error("Помилка при створенні");
        } finally {
            setIsSaving(false);
        }
    };

    // Оновлення існуючого жанру
    const onEditSubmit = async (data: CreateGenreDto) => {
        if (!editingGenre) return;
        setIsSaving(true);
        try {
            await GenreService.update(editingGenre.id, data);
            notify.success("Жанр оновлено");
            setEditingGenre(null);
            reset();
            refresh();
        } catch (err: unknown) {
            console.error(err);
            notify.error("Помилка оновлення");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Ви впевнені? Цей жанр зникне з усіх фільмів.')) return;
        try {
            await GenreService.delete(id);
            notify.success("Жанр видалено");
            refresh();
        } catch (err: unknown) {
            console.error(err);
            notify.error("Не вдалося видалити");
        }
    };

    const handleEditClick = (genre: GenreDto) => {
        setEditingGenre(genre);
        setValue('name', genre.name);
    };

    const handleSort = (sortKey: string) => {
        if (sortBy === sortKey) {
            setIsDesc(!isDesc);
        } else {
            setSortBy(sortKey as 'id' | 'name');
            setIsDesc(false);
        }
    };

    const columns: Column<GenreDto>[] = [
        {
            key: 'id',
            header: 'ID',
            sortable: true,
            sortKey: 'id',
            width: 'w-24',
            render: (genre) => (
                <span className="text-gray-500 font-mono text-xs">
                    #{genre.id}
                </span>
            )
        },
        {
            key: 'name',
            header: "Назва",
            sortable: true,
            sortKey: 'name',
            render: (genre) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500">
                        <Tag size={14} />
                    </div>
                    <span className="font-bold text-gray-100 uppercase tracking-wide">
                        {genre.name}
                    </span>
                </div>
            )
        },
        {
            key: 'actions',
            header: 'Дії',
            width: 'w-32',
            align: 'right',
            render: (genre) => (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleEditClick(genre); }}
                        className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
                        title="Редагувати"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(genre.id); }}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Видалити"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start text-white pb-10 font-sans relative">

            {/* ЛІВА ЧАСТИНА: ФОРМА ДОДАВАННЯ */}
            <div className="w-full lg:w-1/3 lg:sticky lg:top-24 bg-[#1a1d26] p-8 rounded-[32px] border border-gray-800 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-red-600/20 p-2 rounded-lg text-red-600">
                        <Plus size={24} />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tighter">Новий жанр</h2>
                </div>

                <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-5 text-left text-white">
                    <div>
                        <label className="text-[10px] font-black text-gray-500 mb-2 block tracking-widest uppercase">Назва жанру</label>
                        <input
                            {...addForm.register('name', { required: true })}
                            placeholder="Напр. Бойовик"
                            className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-600 transition-all font-bold text-white"
                        />
                    </div>

                    <button disabled={isSaving} className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-red-600/20 mt-2">
                        {isSaving ? <Loader2 className="animate-spin mx-auto" size={18}/> : 'Зберегти'}
                    </button>
                </form>
            </div>

            {/* ПРАВА ЧАСТИНА: ТАБЛИЦЯ */}
            <div className="w-full lg:w-2/3 flex flex-col gap-6">
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Пошук жанрів..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#1a1d26] border border-gray-800 text-sm focus:border-red-600 outline-none transition-all shadow-xl text-white"
                    />
                </div>

                <DataTable
                    data={genres}
                    columns={columns}
                    loading={loading}
                    error={error}
                    onRowClick={handleEditClick} // Клік по рядку відкриває редагування
                    sortConfig={{ sortBy, isDesc }}
                    onSort={handleSort}
                />

                {!loading && totalPages > 0 && (
                    <div className="bg-[#161820] p-4 rounded-3xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                        <PaginationInfo currentPage={currentPage} pageSize={pageSize} totalCount={totalCount} itemName="жанрів" />
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
                    </div>
                )}
            </div>

            {/* MODAL EDIT (спливаюче вікно для редагування) */}
            {editingGenre && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 font-sans">
                    <div className="bg-[#1a1d26] w-full max-w-md rounded-[2.5rem] border border-gray-800 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300 p-8">

                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                                <Pencil size={20} className="text-red-600" />
                                Редагування
                            </h3>
                            <button onClick={() => setEditingGenre(null)} className="p-2 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-500 mb-2 block tracking-widest uppercase">ID: {editingGenre.id}</label>
                                <input
                                    {...register('name', { required: true })}
                                    className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-600 transition-all font-bold text-white text-lg"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingGenre(null)}
                                    className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Скасувати
                                </button>
                                <button
                                    disabled={isSaving}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-red-600/30"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><Check size={16} /> Зберегти</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminGenres;