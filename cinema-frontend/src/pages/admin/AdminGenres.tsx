import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Loader2, Pencil, Check, X, Tag } from 'lucide-react';

import { GenreService } from '../../services/genre.service';
import type { GenreDto, CreateGenreDto, GenreFilterDto } from '../../types/genre';
import { UsePagination } from "../../hooks/UsePagination";
import { Pagination } from "../../components/Pagination";
import { PaginationInfo } from "../../components/PaginationInfo";
import { DataTable, type Column } from "../../components/DataTable";
import { notify } from "../../utils/toast";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { CreateCard } from "../../components/CreateCard";
import { SearchInput } from "../../components/ui/SearchInput";

const genreFields = [
    {
        name: 'name',
        label: "Назва жанру",
        placeholder: "Напр. Action",
        icon: Tag
    }
];

const AdminGenres = () => {
    const editForm = useForm<CreateGenreDto>();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'id' | 'name'>('id');
    const [isDesc, setIsDesc] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [selectedGenre, setSelectedGenre] = useState<GenreDto | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({
        isOpen: false,
        id: null,
        name: ''
    });

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
    } = UsePagination(async (p, ps) => {
        const filter: GenreFilterDto = {
            search: searchTerm || undefined,
            sortBy,
            isDescending: isDesc,
            Page: p,
            PageSize: ps
        };
        return await GenreService.getAll(filter);
    }, [searchTerm, sortBy, isDesc], { pageSize: 6 });

    const handleOpenDetails = (genre: GenreDto) => {
        setSelectedGenre(genre);
        setIsEditMode(false);
        editForm.reset({ name: genre.name });
    };

    const handleAddGenre = async (data: CreateGenreDto) => {
        setIsSaving(true);
        try {
            await GenreService.create(data);
            notify.success("Жанр додано");
            refresh();
        } catch {
            notify.error("Помилка додавання");
        } finally {
            setIsSaving(false);
        }
    };

    const onEditSubmit = async (data: CreateGenreDto) => {
        if (!selectedGenre) return;

        setIsSaving(true);
        try {
            await GenreService.update(selectedGenre.id, data);
            setSelectedGenre({ ...selectedGenre, ...data });
            notify.success("Жанр оновлено");
            setIsEditMode(false);
            refresh();
        } catch {
            notify.error("Помилка оновлення");
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.id) return;

        setIsSaving(true);
        try {
            await GenreService.delete(deleteModal.id);
            notify.success("Жанр видалено");

            if (selectedGenre?.id === deleteModal.id) {
                setSelectedGenre(null);
            }

            refresh();
        } catch {
            notify.error("Не вдалося видалити");
        } finally {
            setIsSaving(false);
            setDeleteModal({ isOpen: false, id: null, name: '' });
        }
    };

    const columns: Column<GenreDto>[] = [
        {
            key: 'id',
            header: 'ID',
            sortable: true,
            sortKey: 'id',
            width: 'w-24',
            render: g => (
                <span className="text-red-600 font-black text-lg tracking-tighter">
                    #{g.id}
                </span>
            )
        },
        {
            key: 'name',
            header: 'Назва',
            sortable: true,
            sortKey: 'name',
            render: g => (
                <span className="font-bold text-gray-100 uppercase">
                    {g.name}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Дії',
            width: 'w-20',
            align: 'right',
            render: genre => (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetails(genre);
                        }}
                        className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
                    >
                        <Pencil size={16} />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModal({
                                isOpen: true,
                                id: genre.id,
                                name: genre.name
                            });
                        }}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start text-white pb-10 font-sans relative">

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Видалити жанр?"
                description={<>Ви впевнені, що хочете видалити жанр <span className="text-white font-bold">"{deleteModal.name}"</span>?</>}
                onConfirm={handleConfirmDelete}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                isLoading={isSaving}
            />

            <CreateCard
                title="Новий жанр"
                buttonText="Зберегти"
                icon={Plus}
                fields={genreFields}
                loading={isSaving}
                onSubmit={handleAddGenre}
            />

            <div className="w-full lg:w-2/3 flex flex-col gap-6">

                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Пошук жанрів..."
                />

                <DataTable
                    data={genres}
                    columns={columns}
                    loading={loading}
                    error={error}
                    onRowClick={handleOpenDetails}
                    sortConfig={{ sortBy, isDesc }}
                    onSort={(key) =>
                        sortBy === key
                            ? setIsDesc(!isDesc)
                            : (setSortBy(key as any), setIsDesc(false))
                    }
                />

                {!loading && totalPages > 0 && (
                    <div className="bg-[#161820] p-4 rounded-3xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                        <PaginationInfo
                            currentPage={currentPage}
                            pageSize={pageSize}
                            totalCount={totalCount}
                            itemName="жанрів"
                        />

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={goToPage}
                        />
                    </div>
                )}
            </div>

            {selectedGenre && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 font-sans">

                    <div className="bg-[#1a1d26] w-full max-w-xl rounded-[2.5rem] border border-gray-800 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300">

                        <div className="p-8 border-b border-gray-800 flex items-center justify-between bg-linear-to-r from-red-600/10 to-transparent">

                            {!isEditMode ? (
                                <h4 className="text-3xl font-black uppercase tracking-tighter text-white">
                                    {selectedGenre.name}
                                </h4>
                            ) : (
                                <input
                                    {...editForm.register('name', { required: true })}
                                    className="w-full bg-[#0f1117] border border-red-600/30 rounded-xl p-2 text-xl font-bold outline-none focus:border-red-600 text-white"
                                />
                            )}

                            <button
                                onClick={() => {
                                    setSelectedGenre(null);
                                    setIsEditMode(false);
                                }}
                                className="p-2 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 bg-gray-900/50 border-t border-gray-800 flex gap-4">

                            {!isEditMode ? (
                                <>
                                    <button
                                        onClick={() => setIsEditMode(true)}
                                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                                    >
                                        <Pencil size={16} className="text-red-600" />
                                        Редагувати
                                    </button>

                                    <button
                                        onClick={() =>
                                            setDeleteModal({
                                                isOpen: true,
                                                id: selectedGenre.id,
                                                name: selectedGenre.name
                                            })
                                        }
                                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-red-600/20"
                                    >
                                        <Trash2 size={16} />
                                        Видалити
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={editForm.handleSubmit(onEditSubmit)}
                                        disabled={isSaving}
                                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-red-600/30"
                                    >
                                        {isSaving
                                            ? <Loader2 className="animate-spin" size={16} />
                                            : <><Check size={16} /> Зберегти зміни</>}
                                    </button>

                                    <button
                                        onClick={() => setIsEditMode(false)}
                                        className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                                    >
                                        Скасувати
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGenres;
