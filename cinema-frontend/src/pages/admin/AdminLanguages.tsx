import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Plus, Trash2, Globe, Loader2,
    Pencil, Check, Languages
} from 'lucide-react';

import { LanguageService } from '../../services/language.service';
import type { LanguageDto, CreateLanguageDto, LanguageFilterDto } from '../../types/language';

import { UsePagination } from "../../hooks/UsePagination";
import { Pagination } from "../../components/ui/Pagination.tsx";
import { PaginationInfo } from "../../components/ui/PaginationInfo.tsx";
import { DataTable, type Column } from "../../components/ui/DataTable.tsx";
import { notify } from "../../utils/toast";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { CreateCard } from "../../components/ui/CreateCard.tsx";
import { SearchInput } from "../../components/ui/SearchInput";
import {AdminModal} from "../../components/ui/AdminModal.tsx";

const languageFields = [
    {
        name: 'name',
        label: "Назва мови",
        placeholder: "Напр. Українська",
        icon: Globe
    }
];

const AdminLanguages = () => {
    // Форма для редагування (в модалці)
    const editForm = useForm<CreateLanguageDto>();

    // --- STATES ---
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'id' | 'name'>('id');
    const [isDesc, setIsDesc] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Стан для модалки деталей/редагування
    const [selectedLanguage, setSelectedLanguage] = useState<LanguageDto | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Стан для видалення
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        id: number | null;
        name: string;
    }>({
        isOpen: false,
        id: null,
        name: ''
    });

    // --- PAGINATION ---
    const {
        items: languages,
        totalCount,
        currentPage,
        totalPages,
        pageSize,
        loading,
        error,
        goToPage,
        refresh,
    } = UsePagination(async (p, ps) => {
        const filter: LanguageFilterDto = {
            search: searchTerm || undefined,
            sortBy,
            isDescending: isDesc,
            Page: p,
            PageSize: ps
        };
        return await LanguageService.getAll(filter);
    }, [searchTerm, sortBy, isDesc], { pageSize: 6 });

    // --- HANDLERS ---

    // Відкриття деталей
    const handleOpenDetails = (language: LanguageDto) => {
        setSelectedLanguage(language);
        setIsEditMode(false);
        editForm.reset({
            name: language.name
        });
    };

    // Створення
    const handleAddLanguage = async (data: CreateLanguageDto) => {
        setIsSaving(true);
        try {
            await LanguageService.create(data);
            notify.success("Мову додано");
            await refresh();
        } catch {
            notify.error("Помилка додавання");
        } finally {
            setIsSaving(false);
        }
    };

    // Редагування (Update)
    const onEditSubmit = async (data: CreateLanguageDto) => {
        if (!selectedLanguage) return;
        setIsSaving(true);
        try {
            // Припускаємо, що у сервісі є метод update(id, data)
            // Якщо немає - додайте його в LanguageService, або видаліть цей блок
            await LanguageService.update(selectedLanguage.id, data);

            setSelectedLanguage({ ...selectedLanguage, ...data });
            notify.success("Дані оновлено");
            setIsEditMode(false);
            await refresh();
        } catch {
            notify.error("Помилка оновлення");
        } finally {
            setIsSaving(false);
        }
    };

    // Видалення
    const handleConfirmDelete = async () => {
        if (!deleteModal.id) return;
        setIsSaving(true);
        try {
            await LanguageService.delete(deleteModal.id);
            notify.success("Мову видалено");
            // Якщо видалили ту, що відкрита в модалці - закриваємо модалку
            if (selectedLanguage?.id === deleteModal.id) setSelectedLanguage(null);
            await refresh();
        } catch {
            notify.error("Не вдалося видалити");
        } finally {
            setIsSaving(false);
            setDeleteModal({ isOpen: false, id: null, name: '' });
        }
    };

    // --- COLUMNS ---
    const columns: Column<LanguageDto>[] = [
        {
            key: 'id',
            header: 'ID',
            sortable: true,
            sortKey: 'id',
            width: 'w-24',
            render: l => (
                <span className="text-red-600 font-black text-lg tracking-tighter">
                    #{l.id}
                </span>
            )
        },
        {
            key: 'name',
            header: 'Назва',
            sortable: true,
            sortKey: 'name',
            render: l => (
                <span className="font-bold text-gray-100 uppercase">
                    {l.name}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Дії',
            width: 'w-24',
            align: 'right',
            render: language => (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetails(language);
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
                                id: language.id,
                                name: language.name
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

            {/* MODAL CONFIRM DELETE */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Видалити мову?"
                description={
                    <>Ви впевнені, що хочете видалити мову <span className="text-white font-bold">"{deleteModal.name}"</span>? Цю дію неможливо скасувати.</>
                }
                onConfirm={handleConfirmDelete}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                isLoading={isSaving}
            />

            {/* LEFT SIDEBAR - CREATE CARD */}
            <CreateCard
                title="Нова мова"
                buttonText="Зберегти"
                icon={Plus}
                fields={languageFields}
                loading={isSaving}
                onSubmit={handleAddLanguage}
            />

            {/* RIGHT CONTENT - TABLE */}
            <div className="w-full lg:w-2/3 flex flex-col gap-6">

                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Пошук мов..."
                />

                <DataTable
                    data={languages}
                    columns={columns}
                    loading={loading}
                    error={error}
                    sortConfig={{ sortBy, isDesc }}
                    onRowClick={handleOpenDetails}
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
                            itemName="мов"
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
                isOpen={!!selectedLanguage}
                onClose={() => { setSelectedLanguage(null); setIsEditMode(false); }}
                maxWidth="max-w-xl"
                title={
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl border-2 border-red-600 p-1 bg-gray-900 flex items-center justify-center shrink-0 shadow-lg shadow-red-600/20">
                            <Languages size={28} className="text-white" />
                        </div>
                        <div className="text-left">
                            {!isEditMode ? (
                                <>
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">Мова</p>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedLanguage?.name}</h2>
                                </>
                            ) : (
                                <>
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">Редагування</p>
                                    <input
                                        {...editForm.register('name', { required: true })}
                                        className="bg-transparent border-b-2 border-red-600 text-2xl font-black text-white outline-none w-full uppercase"
                                        autoFocus
                                    />
                                </>
                            )}
                        </div>
                    </div>
                }
                footer={
                    !isEditMode ? (
                        <>
                            <button
                                onClick={() => setIsEditMode(true)}
                                className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                                <Pencil size={14} className="text-red-600" /> Редагувати
                            </button>
                            <button
                                onClick={() => setDeleteModal({ isOpen: true, id: selectedLanguage!.id, name: selectedLanguage!.name })}
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
                                className="px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                                Скасувати
                            </button>
                        </>
                    )
                }
            >
            </AdminModal>
        </div>
    );
};

export default AdminLanguages;