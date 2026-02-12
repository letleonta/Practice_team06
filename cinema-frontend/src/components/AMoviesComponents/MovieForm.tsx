import { useEffect } from 'react';
import type {UseFormReturn} from 'react-hook-form';
import type { CreateMovieDto } from '../../types/movie';
import { Info, Image, Users, Hash, PlayCircle, Save, ArrowLeft } from 'lucide-react';
import { FormSection, FormInput, FormSelect, FormTextarea } from '../Form/FormSection';
import { AsyncMultiSelectGrid, AsyncSingleSelectGrid } from './AsyncSelectGrids';
import { ActorService } from '../../services/actor.service';
import { DirectorService } from '../../services/director.service';
import { GenreService } from '../../services/genre.service';
import type {DirectorDto} from "../../types/director.ts";
import type {ActorDto} from "../../types/actor.ts";
import type {GenreDto} from "../../types/genre.ts";

interface Props {
    formMethods: UseFormReturn<CreateMovieDto>;
    isEditing: boolean;
    onCancel: () => void;
    onSubmit: (data: CreateMovieDto) => Promise<void>;
    onAddDirector: () => void;
    onAddActor: () => void;
    onAddGenre: () => void;
    refreshTrigger: number;
}

export const MovieForm = ({
                              formMethods, isEditing,
                              onCancel, onSubmit, onAddDirector, onAddActor, onAddGenre, refreshTrigger
                          }: Props) => {
    const { register, handleSubmit, watch, setValue, getValues } = formMethods;

    useEffect(() => {
        if (isEditing) {
            const currentActors = getValues('movieActors') || [];
            const currentGenres = getValues('genreIds') || [];

            if (currentActors.length > 0) {
                setValue('movieActors', currentActors, { shouldDirty: false, shouldTouch: false });
            }
            if (currentGenres.length > 0) {
                setValue('genreIds', currentGenres.map(Number), { shouldDirty: false, shouldTouch: false });
            }
        }
    }, [isEditing, getValues, setValue]);

    const selectedDirectorId = watch('directorId');
    const watchedGenreIds = watch('genreIds') || [];
    const watchedMovieActors = watch('movieActors') || [];

    const toggleGenre = (id: number) => {
        const current = (getValues('genreIds') || []).map(Number);
        const numericId = Number(id);
        const newValues = current.includes(numericId)
            ? current.filter(v => v !== numericId)
            : [...current, numericId];
        setValue('genreIds', newValues, { shouldDirty: true, shouldValidate: true });
    };

    const toggleActor = (id: number) => {
        const current = getValues('movieActors') || [];
        const numericId = Number(id);

        const exists = current.some(a => a.actorId === numericId);
        let newValues;

        if (exists) {
            newValues = current.filter(a => a.actorId !== numericId);
        } else {
            newValues = [...current, { actorId: numericId, roleName: '' }];
        }
        setValue('movieActors', newValues, { shouldDirty: true, shouldValidate: true });
    };

    const updateActorRole = (id: number, role: string) => {
        const current = getValues('movieActors') || [];
        const newValues = current.map(a =>
            a.actorId === id ? { ...a, roleName: role } : a
        );
        setValue('movieActors', newValues, { shouldDirty: true });
    };

    const getRoleValue = (id: number) => {
        const actor = watchedMovieActors.find(a => a.actorId === id);
        return actor ? actor.roleName : '';
    };

    const actorIdsOnly = watchedMovieActors.map(a => a.actorId);
    const genreIdsOnly = watchedGenreIds.map(Number);

    return (
        <div className="animate-fade-in pb-20">
            <div className="flex items-center gap-6 mb-10">
                <button onClick={onCancel} className="bg-gray-800/50 p-4 rounded-2xl hover:bg-red-600 text-white transition-colors">
                    <ArrowLeft size={24}/>
                </button>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
                    {isEditing ? `Редагування: ${watch('title')}` : 'Новий фільм'}
                </h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-10 items-start">
                <aside className="lg:sticky lg:top-10 w-full lg:w-64 space-y-4">
                    <nav className="bg-[#1a1d26] p-6 rounded-[40px] border border-gray-800 shadow-xl">
                        {[
                            {id: 'basic', label: 'Головне', icon: Info},
                            {id: 'media', label: 'Медіа & Дати', icon: PlayCircle},
                            {id: 'staff', label: 'Команда', icon: Users},
                            {id: 'tax', label: 'Жанри', icon: Hash}
                        ].map(item => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => document.getElementById(item.id)?.scrollIntoView({behavior:'smooth', block:'start'})}
                                className="w-full flex items-center gap-3 p-4 rounded-2xl text-xs font-black text-gray-500 hover:text-white transition-all uppercase text-left group"
                            >
                                <item.icon size={18} className="group-hover:text-red-600"/> {item.label}
                            </button>
                        ))}
                    </nav>
                    <button type="button" onClick={handleSubmit(onSubmit)} className="w-full bg-red-600 text-white py-6 rounded-4xl font-black uppercase text-xs shadow-xl hover:bg-red-700 active:scale-95 transition-all">
                        <Save size={20} className="inline mr-2"/> Зберегти
                    </button>
                </aside>

                <div className="flex-1 space-y-10 w-full">
                    <form className="space-y-10">
                        <FormSection id="basic" title="Головне" icon={Info} iconColor="text-red-600">
                            <div className="space-y-6">
                                <FormInput label="Назва фільму" {...register('title', {required: true})} />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <FormInput label="Рейтинг" labelColor="text-yellow-500" type="number" step="0.1" {...register('rating')} />
                                    <FormInput label="Хвилини" labelColor="text-blue-400" type="number" {...register('durationMin')} />
                                    <FormInput label="Ціна (₴)" labelColor="text-green-500" type="number" {...register('basePrice')} />
                                </div>
                                <FormSelect label="Віковий ценз" {...register('ageRestriction')}>
                                    <option value={0}>0+</option>
                                    <option value={1}>12+</option>
                                    <option value={2}>16+</option>
                                    <option value={3}>18+</option>
                                </FormSelect>
                                <FormTextarea label="Опис сюжету" rows={5} {...register('description')} />
                            </div>
                        </FormSection>

                        <FormSection id="media" title="Медіа" icon={Image} iconColor="text-blue-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <FormInput label="URL Постера" {...register('posterUri')} />
                                    <FormInput label="URL Трейлера" {...register('trailerUri')} />
                                </div>
                                <div className="bg-gray-900/40 p-6 rounded-3xl border border-gray-800 space-y-4 shadow-inner">
                                    <FormInput label="Прем'єра" type="date" {...register('releaseDate')} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormInput label="Старт" labelColor="text-green-500" type="date" {...register('startDate')} />
                                        <FormInput label="Кінець" labelColor="text-red-500" type="date" {...register('endDate')} />
                                    </div>
                                </div>
                            </div>
                        </FormSection>

                        <FormSection id="staff" title="Команда" icon={Users} iconColor="text-purple-500">
                            <AsyncSingleSelectGrid
                                title="Режисер"
                                icon={<Users size={20}/>}
                                color="amber"
                                searchPlaceholder="Прізвище режисера..."
                                fetchData={(params) => DirectorService.getAll({ ...params, search: params.search })}
                                selectedId={selectedDirectorId ? Number(selectedDirectorId) : undefined}
                                onSelect={(id) => setValue('directorId', id, { shouldDirty: true })}
                                onAdd={onAddDirector}
                                renderLabel={(d: DirectorDto) => `${d.firstName} ${d.lastName}`}
                                itemsPerPage={6}
                                refreshTrigger={refreshTrigger}
                            />

                            <AsyncMultiSelectGrid
                                title="Актори"
                                icon={<Users size={20}/>}
                                color="amber"
                                searchPlaceholder="Прізвище актора..."
                                fetchData={(params) => ActorService.getAll({ ...params, search: params.search })}
                                selectedIds={actorIdsOnly}
                                onToggle={toggleActor}
                                onAdd={onAddActor}
                                renderLabel={(a: ActorDto) => `${a.firstName} ${a.lastName}`}
                                itemsPerPage={6}
                                refreshTrigger={refreshTrigger}
                                withRoleInput={true}
                                getRoleValue={getRoleValue}
                                onRoleChange={updateActorRole}
                            />
                        </FormSection>

                        <FormSection id="tax" title="Жанри" icon={Hash} iconColor="text-purple-500">
                            <AsyncMultiSelectGrid
                                title="Жанри"
                                icon={<Hash size={20}/>}
                                color="purple"
                                searchPlaceholder="Назва жанру..."
                                fetchData={(params) => GenreService.getAll({ ...params, search: params.search })}
                                selectedIds={genreIdsOnly}
                                onToggle={toggleGenre}
                                onAdd={onAddGenre}
                                renderLabel={(g: GenreDto) => g.name || ''}
                                itemsPerPage={8}
                                refreshTrigger={refreshTrigger}
                            />
                        </FormSection>
                    </form>
                </div>
            </div>
        </div>
    );
};