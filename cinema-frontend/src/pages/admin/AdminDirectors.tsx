import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    UserPlus, Trash2, Loader2, User as UserIcon,
    X, Pencil, Film, Calendar, Clapperboard, Check, Upload
} from 'lucide-react';

import { DirectorService } from '../../services/director.service.ts';
import type { CreateDirectorDto, DirectorDto, DirectorFilterDto, DirectorMovieDto } from '../../types/director';
import { UsePagination } from "../../hooks/UsePagination.ts";
import { useLocalPagination } from "../../hooks/UseLocalPagination.ts";
import { Pagination } from "../../components/Pagination";
import { PaginationInfo } from "../../components/PaginationInfo";
import { DataTable, type Column } from "../../components/DataTable.tsx";
import { notify } from "../../utils/toast";
import { ConfirmModal } from "../../components/ui/ConfirmModal.tsx";
import { CreateCard } from "../../components/CreateCard.tsx";
import { API_CONFIG } from "../../../config.ts";
import {SearchInput} from "../../components/ui/SearchInput.tsx";

const directorFields = [
    {
        name: 'firstName',
        label: "Ім'я",
        placeholder: "Напр. Крістофер",
        icon: UserIcon
    },
    {
        name: 'lastName',
        label: "Прізвище",
        placeholder: "Напр. Нолан",
        icon: UserIcon
    },
    {
        name: 'photoUri',
        label: "Посилання на фото",
        placeholder: "https://...",
        required: false,
        icon: Upload
    },
];

const AdminDirectors = () => {
    const editForm = useForm<CreateDirectorDto>();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'id' | 'firstname' | 'lastname'>('id');
    const [isDesc, setIsDesc] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [selectedDirector, setSelectedDirector] = useState<DirectorDto | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({
        isOpen: false, id: null, name: ''
    });

    // 1. ГОЛОВНА ПАГІНАЦІЯ (Режисери - впливає на URL)
    const {
        items: directors, totalCount, currentPage, totalPages, pageSize, loading, error, goToPage, refresh,
    } = UsePagination(async (p, ps) => {
        const filter: DirectorFilterDto = {
            search: searchTerm || undefined,
            sortBy,
            isDescending: isDesc,
            Page: p,
            PageSize: ps
        };
        return await DirectorService.getAll(filter);
    }, [searchTerm, sortBy, isDesc], { pageSize: 6 });

    // 2. ЛОКАЛЬНА ПАГІНАЦІЯ (Фільми режисера - НЕ впливає на URL)
    const {
        items: directorMovies,
        loading: loadingMovies,
        currentPage: moviePage,
        totalPages: totalMoviePages,
        goToPage: goToMoviePage
    } = useLocalPagination<DirectorMovieDto>(
        async (page, size) => {
            if (!selectedDirector) return { items: [], totalCount: 0, page, pageSize: size, totalPages: 0, hasPreviousPage: false, hasNextPage: false };
            return await DirectorService.getDirectorMovies(selectedDirector.id, { Page: page, PageSize: size });
        },
        [selectedDirector?.id],
        { pageSize: 4}
    );

    // --- ОБРОБНИКИ ПОДІЙ ---

    const handleOpenDetails = (director: DirectorDto) => {
        setSelectedDirector(director);
        setIsEditMode(false);
        editForm.reset({
            firstName: director.firstName,
            lastName: director.lastName,
            photoUri: director.photoUri || ''
        });
    };

    const handleAddDirector = async (data: CreateDirectorDto) => {
        setIsSaving(true);
        try {
            await DirectorService.create({ ...data, photoUri: data.photoUri?.trim() || undefined });
            notify.success("Режисера додано");
            refresh();
        } catch (err) { notify.error("Помилка додавання"); }
        finally { setIsSaving(false); }
    };

    const onEditSubmit = async (data: CreateDirectorDto) => {
        if (!selectedDirector) return;
        setIsSaving(true);
        try {
            const payload = { ...data, photoUri: data.photoUri?.trim() || undefined };
            await DirectorService.update(selectedDirector.id, payload);
            setSelectedDirector({ ...selectedDirector, ...payload });
            notify.success("Дані оновлено");
            setIsEditMode(false);
            refresh();
        } catch (err) { notify.error("Помилка оновлення"); }
        finally { setIsSaving(false); }
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.id) return;
        setIsSaving(true);
        try {
            await DirectorService.delete(deleteModal.id);
            notify.success("Режисера видалено");
            if (selectedDirector?.id === deleteModal.id) setSelectedDirector(null);
            refresh();
        } catch (err) { notify.error("Не вдалося видалити"); }
        finally { setIsSaving(false); setDeleteModal({ isOpen: false, id: null, name: '' }); }
    };

    const columns: Column<DirectorDto>[] = [
        {
            key: 'photoUri',
            header: 'Фото',
            width: 'w-20',
            render: (director) => (
                <div className="w-12 h-12 rounded-2xl bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center">
                    {director.photoUri ? (
                        <img src={director.photoUri.startsWith('http') ? director.photoUri : `${API_CONFIG.BASE_URL}${director.photoUri}`} className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon size={20} className="text-gray-600" />
                    )}
                </div>
            )
        },
        { key: 'id', header: 'ID', sortable: true, sortKey: 'id', width: 'w-24', render: (d) => <span className="text-red-600 font-black text-lg tracking-tighter">#{d.id}</span> },
        { key: 'firstName', header: "Ім'я", sortable: true, sortKey: 'firstname', render: (d) => <span className="font-bold text-gray-100 uppercase">{d.firstName}</span> },
        { key: 'lastName', header: 'Прізвище', sortable: true, sortKey: 'lastname', render: (d) => <span className="font-bold text-gray-100 uppercase">{d.lastName}</span> },
        {
            key: 'actions',
            header: 'Дії',
            width: 'w-20',
            align: 'right',
            render: (director) => (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleOpenDetails(director); }} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-xl transition-all"><Pencil size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, id: director.id, name: `${director.firstName} ${director.lastName}` }); }} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={16} /></button>
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start text-white pb-10 font-sans relative">
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Видалити режисера?"
                description={<>Ви впевнені, що хочете видалити режисера <span className="text-white font-bold">"{deleteModal.name}"</span>? Усі дані про нього будуть стерті.</>}
                onConfirm={handleConfirmDelete}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                isLoading={isSaving}
            />

            <CreateCard title="Новий режисер" buttonText="Зберегти" icon={UserPlus} fields={directorFields} loading={isSaving} onSubmit={handleAddDirector} />

            <div className="w-full lg:w-2/3 flex flex-col gap-6">
                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Пошук режисерів..."
                />

                <DataTable data={directors} columns={columns} loading={loading} error={error} onRowClick={handleOpenDetails} sortConfig={{ sortBy, isDesc }} onSort={(key) => sortBy === key ? setIsDesc(!isDesc) : (setSortBy(key as any), setIsDesc(false))} />

                {!loading && totalPages > 0 && (
                    <div className="bg-[#161820] p-4 rounded-3xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                        <PaginationInfo currentPage={currentPage} pageSize={pageSize} totalCount={totalCount} itemName="режисерів" />
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
                    </div>
                )}
            </div>

            {/* МОДАЛКА ДЕТАЛЕЙ */}
            {selectedDirector && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 font-sans">
                    <div className="bg-[#1a1d26] w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2.5rem] border border-gray-800 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300">

                        {/* Header Section */}
                        <div className="p-8 border-b border-gray-800 flex items-center gap-6 bg-linear-to-r from-red-600/10 to-transparent">
                            <div className="w-24 h-24 rounded-2xl border-2 border-red-600 p-1 overflow-hidden bg-gray-900 shrink-0">
                                {selectedDirector.photoUri ? (
                                    <img src={selectedDirector.photoUri.startsWith('http') ? selectedDirector.photoUri : `${API_CONFIG.BASE_URL}${selectedDirector.photoUri}`} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-700"><UserIcon size={40} /></div>
                                )}
                            </div>
                            <div className="flex-1 text-left">
                                {!isEditMode ? (
                                    <>
                                        <h4 className="text-3xl font-black uppercase tracking-tighter text-white leading-none mb-1">{selectedDirector.firstName}</h4>
                                        <h4 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">{selectedDirector.lastName}</h4>
                                    </>
                                ) : (
                                    <div className="space-y-2 pr-4 text-left">
                                        <input {...editForm.register('firstName', { required: true })} className="w-full bg-[#0f1117] border border-red-600/30 rounded-xl p-2 text-xl font-bold outline-none focus:border-red-600 text-white" />
                                        <input {...editForm.register('lastName', { required: true })} className="w-full bg-[#0f1117] border border-red-600/30 rounded-xl p-2 text-xl font-bold outline-none focus:border-red-600 text-white" />
                                    </div>
                                )}
                            </div>
                            <button onClick={() => { setSelectedDirector(null); setIsEditMode(false); }} className="p-2 self-start hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-all"><X size={24} /></button>
                        </div>

                        {/* Content Area */}
                        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar text-white text-left font-sans">
                            {isEditMode && (
                                <div className="mb-8 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-2 block font-sans">Посилання на фото</label>
                                    <div className="relative">
                                        <Upload size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input {...editForm.register('photoUri')} className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-red-600 text-white font-sans" />
                                    </div>
                                </div>
                            )}

                            <div className="mb-6 flex items-center gap-2 text-left font-sans">
                                <Clapperboard size={18} className="text-red-600 font-sans" />
                                <h5 className="font-black uppercase text-xs tracking-widest text-gray-400 font-sans">Фільмографія</h5>
                            </div>

                            {loadingMovies ? (
                                <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-red-600" size={32} /></div>
                            ) : directorMovies.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-3 font-sans">
                                        {directorMovies.map(movie => (
                                            <div key={movie.movieId} className="bg-gray-900/50 border border-gray-800 p-4 rounded-2xl flex items-center justify-between group">
                                                <div className="flex items-center gap-4 text-left">
                                                    <div className="p-3 bg-red-600/10 rounded-xl text-red-600"><Film size={20} /></div>
                                                    <div className="text-left font-sans">
                                                        <p className="font-bold text-base uppercase text-white font-sans leading-tight">{movie.title}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase mt-1 flex items-center gap-1.5 font-sans">
                                                            <Calendar size={10} className="text-red-600" /> {movie.releaseDate || 'Дата TBA'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* ПАГІНАЦІЯ ФІЛЬМІВ */}
                                    {totalMoviePages > 1 && (
                                        <div className="pt-6 border-t border-gray-800/50">
                                            <Pagination
                                                currentPage={moviePage}
                                                totalPages={totalMoviePages}
                                                onPageChange={goToMoviePage}
                                                className="scale-90"
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-10 text-center text-gray-600 uppercase text-[10px] font-black tracking-widest font-sans">Проєкти не знайдено</div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 bg-gray-900/50 border-t border-gray-800 flex gap-4 font-sans">
                            {!isEditMode ? (
                                <>
                                    <button onClick={() => { setIsEditMode(true); editForm.setValue('firstName', selectedDirector.firstName); editForm.setValue('lastName', selectedDirector.lastName); editForm.setValue('photoUri', selectedDirector.photoUri || ''); }} className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all font-sans"><Pencil size={16} className="text-red-600" /> Редагувати</button>
                                    <button onClick={() => setDeleteModal({ isOpen: true, id: selectedDirector.id, name: `${selectedDirector.firstName} ${selectedDirector.lastName}` })} className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-red-600/20 font-sans"><Trash2 size={16} /> Видалити</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={editForm.handleSubmit(onEditSubmit)} disabled={isSaving} className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-red-600/30 font-sans">{isSaving ? <Loader2 className="animate-spin" size={16} /> : <><Check size={16} /> Зберегти зміни</>}</button>
                                    <button onClick={() => setIsEditMode(false)} className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all font-sans">Скасувати</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDirectors;