import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Loader2, Pencil, Check, Tag } from 'lucide-react';

import { GenreService } from '../../services/genre.service';
import type { GenreDto, CreateGenreDto, GenreFilterDto } from '../../types/genre';
import { UsePagination } from "../../hooks/UsePagination";
import { Pagination } from "../../components/ui/Pagination.tsx";
import { PaginationInfo } from "../../components/ui/PaginationInfo.tsx";
import { DataTable, type Column } from "../../components/ui/DataTable.tsx";
import { notify } from "../../utils/toast";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { CreateCard } from "../../components/ui/CreateCard.tsx";
import { SearchInput } from "../../components/ui/SearchInput";
import {AdminModal} from "../../components/ui/AdminModal.tsx";

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
            await refresh();
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
            await refresh();
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

            await refresh();
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
                    onSort={(key) => {
                        const typedKey = key as 'id' | 'name';

                        if (sortBy === typedKey) {
                            setIsDesc(!isDesc);
                        } else {
                            setSortBy(typedKey);
                            setIsDesc(false);
                        }
                    }}
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

            <AdminModal
                isOpen={!!selectedGenre}
                onClose={() => { setSelectedGenre(null); setIsEditMode(false); }}
                maxWidth="max-w-md"
                title={
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl border-2 border-red-600 p-1 bg-gray-900 flex items-center justify-center shrink-0 shadow-lg shadow-red-600/20">
                            <Tag size={24} className="text-white" />
                        </div>
                        <div className="text-left flex-1">
                            {!isEditMode ? (
                                <>
                                    <p className="text-[9px] font-black text-red-600 uppercase tracking-[0.2em] leading-none mb-1">Жанр</p>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none truncate">
                                        {selectedGenre?.name}
                                    </h2>
                                </>
                            ) : (
                                <div className="w-full">
                                    <p className="text-[9px] font-black text-red-600 uppercase tracking-[0.2em] leading-none mb-1">Редагування</p>
                                    <input
                                        {...editForm.register('name', { required: true })}
                                        className="bg-transparent border-b-2 border-red-600 text-2xl font-black text-white outline-none w-full uppercase py-0"
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                }
                footer={
                    <div className="flex w-full gap-3 items-center justify-center">
                        {!isEditMode ? (
                            <>
                                <button
                                    onClick={() => setIsEditMode(true)}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    <Pencil size={14} className="text-red-600" /> Редагувати
                                </button>
                                <button
                                    onClick={() => setDeleteModal({ isOpen: true, id: selectedGenre!.id, name: selectedGenre!.name })}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-red-600/20"
                                >
                                    <Trash2 size={14} /> Видалити
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={editForm.handleSubmit(onEditSubmit)}
                                    disabled={isSaving}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-red-600/30"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><Check size={16} /> Зберегти</>}
                                </button>
                                <button
                                    onClick={() => setIsEditMode(false)}
                                    className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Скасувати
                                </button>
                            </>
                        )}
                    </div>
                }
            >
            </AdminModal>
        </div>
    );
};

export default AdminGenres;
