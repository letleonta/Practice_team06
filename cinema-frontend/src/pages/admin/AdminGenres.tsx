import { useState } from 'react';
import { Plus, Trash2, Globe } from 'lucide-react';

import { LanguageService } from '../../services/language.service';
import type { LanguageDto, CreateLanguageDto, LanguageFilterDto } from '../../types/language';

import { UsePagination } from "../../hooks/UsePagination";
import { Pagination } from "../../components/Pagination";
import { PaginationInfo } from "../../components/PaginationInfo";
import { DataTable, type Column } from "../../components/DataTable";
import { notify } from "../../utils/toast";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { CreateCard } from "../../components/CreateCard";
import { SearchInput } from "../../components/ui/SearchInput";

const languageFields = [
    {
        name: 'name',
        label: "Назва мови",
        placeholder: "Напр. Українська",
        icon: Globe
    }
];

const AdminLanguages = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'id' | 'name'>('id');
    const [isDesc, setIsDesc] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        id: number | null;
        name: string;
    }>({
        isOpen: false,
        id: null,
        name: ''
    });

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


    const handleAddLanguage = async (data: CreateLanguageDto) => {
        setIsSaving(true);
        try {
            await LanguageService.create(data);
            notify.success("Мову додано");
            refresh();
        } catch {
            notify.error("Помилка додавання");
        } finally {
            setIsSaving(false);
        }
    };


    const handleConfirmDelete = async () => {
        if (!deleteModal.id) return;

        setIsSaving(true);

        try {
            await LanguageService.delete(deleteModal.id);
            notify.success("Мову видалено");
            refresh();
        } catch {
            notify.error("Не вдалося видалити");
        } finally {
            setIsSaving(false);
            setDeleteModal({ isOpen: false, id: null, name: '' });
        }
    };


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
            width: 'w-20',
            align: 'right',
            render: language => (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Видалити мову?"
                description={
                    <>Ви впевнені, що хочете видалити мову <span className="text-white font-bold">"{deleteModal.name}"</span>?</>
                }
                onConfirm={handleConfirmDelete}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                isLoading={isSaving}
            />

            <CreateCard
                title="Нова мова"
                buttonText="Зберегти"
                icon={Plus}
                fields={languageFields}
                loading={isSaving}
                onSubmit={handleAddLanguage}
            />

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
        </div>
    );
};

export default AdminLanguages;
