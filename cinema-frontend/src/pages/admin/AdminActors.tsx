import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    UserPlus,
    Trash2,
    Search,
    Loader2,
    User as UserIcon,
    X,
    Pencil,
    Film,
    Calendar,
    Clapperboard,
    Check,
    Upload
} from 'lucide-react';

import { ActorService } from '../../services/actor.service.ts';
import type { CreateActorDto, ActorDto, ActorFilterDto, ActorMovieDto } from '../../types/actor';
import { UsePagination } from "../../hooks/UsePagination.ts";
import { Pagination } from "../../components/Pagination";
import { PaginationInfo } from "../../components/PaginationInfo";
import { DataTable, type Column } from "../../components/DataTable.tsx";
import { notify } from "../../utils/toast";

const BASE_URL = "http://localhost:5144";

const AdminActors = () => {
    const { register, handleSubmit, reset, setValue } = useForm<CreateActorDto>();
    const addForm = useForm<CreateActorDto>();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'id' | 'firstname' | 'lastname'>('id');
    const [isDesc, setIsDesc] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [selectedActor, setSelectedActor] = useState<ActorDto | null>(null);
    const [actorMovies, setActorMovies] = useState<ActorMovieDto[]>([]);
    const [loadingMovies, setLoadingMovies] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const fetchActors = async (page: number, pageSize: number) => {
        const filter: ActorFilterDto = {
            search: searchTerm || undefined,
            sortBy: sortBy,
            isDescending: isDesc,
            Page: page,
            PageSize: pageSize,
        };
        return await ActorService.getAll(filter);
    };

    // Оновлений виклик хука
    const {
        items: actors,
        totalCount,
        currentPage,
        totalPages,
        pageSize,
        loading,
        error,
        goToPage,
        refresh, // Отримуємо функцію refresh
    } = UsePagination(
        fetchActors,
        [searchTerm, sortBy, isDesc], // Прибрали refreshTrigger
        { pageSize: 6 }
    );

    const handleOpenDetails = async (actor: ActorDto) => {
        setSelectedActor(actor);
        setLoadingMovies(true);
        setIsEditMode(false);
        try {
            const movies = await ActorService.getActorMovies(actor.id);
            setActorMovies(movies);
        } catch (err) {
            console.error("Movies load error:", err);
            setActorMovies([]);
        } finally {
            setLoadingMovies(false);
        }
    };

    const onSubmit = async (data: CreateActorDto) => {
        setIsSaving(true);
        try {
            const payload = {
                ...data,
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                photoUri: data.photoUri?.trim() === "" ? undefined : data.photoUri?.trim()
            };

            if (isEditMode && selectedActor) {
                await ActorService.update(selectedActor.id, payload as CreateActorDto);

                setSelectedActor({ ...selectedActor, ...payload } as ActorDto);

                notify.success("Дані оновлено");
                setIsEditMode(false);

                // Оновлюємо список без скидання сторінки
                refresh();

            } else {
                await ActorService.create(payload as CreateActorDto);
                notify.success("Актора додано");
                reset();
                setSelectedActor(null);

                // Тут також можна використати refresh(), щоб залишитись на поточній сторінці,
                // або goToPage(1), якщо хочете перейти на початок.
                refresh();
            }
        } catch (err: unknown) {
            console.error(err);
            notify.error("Помилка операції");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Видалити цього актора?')) return;
        try {
            await ActorService.delete(id);
            notify.success("Актора видалено");
            setSelectedActor(null);

            // Оновлюємо дані
            refresh();
        } catch (err: unknown) {
            console.error(err);
            notify.error("Не вдалося видалити");
        }
    };

    const handleSort = (sortKey: string) => {
        if (sortBy === sortKey) {
            setIsDesc(!isDesc);
        } else {
            setSortBy(sortKey as 'id' | 'firstname' | 'lastname');
            setIsDesc(false);
        }
    };

    const columns: Column<ActorDto>[] = [
        {
            key: 'photoUri',
            header: 'Фото',
            width: 'w-20',
            render: (actor) => (
                <div className="w-12 h-12 rounded-2xl bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center">
                    {actor.photoUri ? (
                        <img
                            src={actor.photoUri.startsWith('http') ? actor.photoUri : `${BASE_URL}${actor.photoUri}`}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <UserIcon size={20} className="text-gray-600" />
                    )}
                </div>
            )
        },
        {
            key: 'id',
            header: 'ID',
            sortable: true,
            sortKey: 'id',
            width: 'w-24',
            render: (actor) => (
                <span className="text-red-600 font-black text-lg tracking-tighter">
                    #{actor.id}
                </span>
            )
        },
        {
            key: 'firstName',
            header: "Ім'я",
            sortable: true,
            sortKey: 'firstname',
            render: (actor) => <span className="font-bold text-gray-100 uppercase">{actor.firstName}</span>
        },
        {
            key: 'lastName',
            header: 'Прізвище',
            sortable: true,
            sortKey: 'lastname',
            render: (actor) => <span className="font-bold text-gray-100 uppercase">{actor.lastName}</span>
        },
        {
            key: 'actions',
            header: 'Дії',
            width: 'w-20',
            align: 'right',
            render: (actor) => (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleOpenDetails(actor); }} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-xl transition-all">
                        <Pencil size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(actor.id); }} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start text-white pb-10 font-sans relative">

            {/* ЛІВА ЧАСТИНА: ФОРМА ДОДАВАННЯ (завжди видима) */}
            <div className="w-full lg:w-1/3 lg:sticky lg:top-24 bg-[#1a1d26] p-8 rounded-[32px] border border-gray-800 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-red-600/20 p-2 rounded-lg text-red-600">
                        {isEditMode ? <Pencil size={24} /> : <UserPlus size={24} />}
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tighter">Новий актор</h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left text-white">
                    <input {...addForm.register('firstName', { required: true })} placeholder="Ім'я" className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-600 transition-all font-bold text-white" />
                    <input {...addForm.register('lastName', { required: true })} placeholder="Прізвище" className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-600 transition-all font-bold text-white" />
                    <input {...addForm.register('photoUri')} placeholder="URL фото" className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-600 transition-all text-sm text-white" />

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
                        placeholder="Пошук..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#1a1d26] border border-gray-800 text-sm focus:border-red-600 outline-none transition-all shadow-xl text-white"
                    />
                </div>

                <DataTable
                    data={actors}
                    columns={columns}
                    loading={loading}
                    error={error}
                    onRowClick={handleOpenDetails}
                    sortConfig={{ sortBy, isDesc }}
                    onSort={handleSort}
                />

                {!loading && totalPages > 0 && (
                    <div className="bg-[#161820] p-4 rounded-3xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                        <PaginationInfo currentPage={currentPage} pageSize={pageSize} totalCount={totalCount} itemName="акторів" />
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
                    </div>
                )}
            </div>

            {/* ПОПАП ДЕТАЛЕЙ ТА РЕДАГУВАННЯ */}
            {selectedActor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 font-sans">
                    <div className="bg-[#1a1d26] w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2.5rem] border border-gray-800 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300">

                        {/* Header Section */}
                        <div className="p-8 border-b border-gray-800 flex items-center gap-6 bg-linear-to-r from-red-600/10 to-transparent">
                            <div className="w-24 h-24 rounded-2xl border-2 border-red-600 p-1 shadow-lg shadow-red-600/10 overflow-hidden bg-gray-900 shrink-0">
                                {selectedActor.photoUri ? (
                                    <img
                                        src={selectedActor.photoUri.startsWith('http') ? selectedActor.photoUri : `${BASE_URL}${selectedActor.photoUri}`}
                                        className="w-full h-full object-cover rounded-xl"
                                        alt=""
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                                        <UserIcon size={40} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 text-left font-sans">
                                {!isEditMode ? (
                                    <>
                                        <h4 className="text-3xl font-black uppercase tracking-tighter text-white leading-none mb-1">
                                            {selectedActor.firstName}
                                        </h4>
                                        <h4 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">
                                            {selectedActor.lastName}
                                        </h4>
                                    </>
                                ) : (
                                    <div className="space-y-2 pr-4 font-sans text-left">
                                        <input
                                            {...register('firstName', { required: true })}
                                            className="w-full bg-[#0f1117] border border-red-600/30 rounded-xl p-2 text-xl font-bold outline-none focus:border-red-600 transition-all text-white font-sans"
                                            placeholder="Ім'я"
                                        />
                                        <input
                                            {...register('lastName', { required: true })}
                                            className="w-full bg-[#0f1117] border border-red-600/30 rounded-xl p-2 text-xl font-bold outline-none focus:border-red-600 transition-all text-white font-sans"
                                            placeholder="Прізвище"
                                        />
                                    </div>
                                )}
                            </div>

                            <button onClick={() => { setSelectedActor(null); setIsEditMode(false); }} className="p-2 self-start hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar text-white text-left font-sans">
                            {isEditMode && (
                                <div className="mb-8 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-2 block font-sans">Посилання на фото (URI)</label>
                                    <div className="relative">
                                        <Upload size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            {...register('photoUri')}
                                            className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-red-600 transition-all font-sans text-white font-sans"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mb-6 flex items-center gap-2 text-left font-sans">
                                <Clapperboard size={18} className="text-red-600 font-sans" />
                                <h5 className="font-black uppercase text-xs tracking-widest text-gray-400 font-sans">Фільмографія</h5>
                            </div>

                            {loadingMovies ? (
                                <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-red-600" size={32} /></div>
                            ) : actorMovies.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3 font-sans">
                                    {actorMovies.map(movie => (
                                        <div key={movie.movieId} className="bg-gray-900/50 border border-gray-800 p-4 rounded-2xl flex items-center justify-between group font-sans">
                                            <div className="flex items-center gap-4 text-left font-sans">
                                                <div className="p-3 bg-red-600/10 rounded-xl text-red-600"><Film size={20} /></div>
                                                <div className="text-left font-sans">
                                                    <p className="font-bold text-base leading-tight uppercase text-white font-sans">{movie.title}</p>
                                                    <p className="text-[10px] text-gray-500 font-black uppercase mt-1 flex items-center gap-1.5 font-sans">
                                                        <Calendar size={10} className="text-red-600" /> {movie.releaseDate || 'Дата TBA'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right font-sans">
                                                <p className="text-[10px] text-gray-600 uppercase font-black font-sans leading-none mb-1">Роль</p>
                                                <p className="text-sm font-bold text-red-500 uppercase font-sans leading-none">{movie.roleName || '—'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-10 text-center text-gray-600 uppercase text-[10px] font-black tracking-widest font-sans">Проєкти не знайдено</div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 bg-gray-900/50 border-t border-gray-800 flex gap-4 font-sans">
                            {!isEditMode ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsEditMode(true);
                                            setValue('firstName', selectedActor.firstName);
                                            setValue('lastName', selectedActor.lastName);
                                            setValue('photoUri', selectedActor.photoUri || '');
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all font-sans"
                                    >
                                        <Pencil size={16} className="text-red-600 font-sans" /> Редагувати
                                    </button>
                                    <button
                                        onClick={() => handleDelete(selectedActor.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-red-600/20 font-sans"
                                    >
                                        <Trash2 size={16} /> Видалити
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSubmit(onSubmit)}
                                        disabled={isSaving}
                                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-red-600/30 font-sans"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin font-sans" size={16} /> : <><Check size={16} className="font-sans" /> Зберегти зміни</>}
                                    </button>
                                    <button
                                        onClick={() => setIsEditMode(false)}
                                        className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all font-sans"
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

export default AdminActors;