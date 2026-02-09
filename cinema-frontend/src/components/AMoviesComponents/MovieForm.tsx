import type {UseFormReturn} from 'react-hook-form';
import type { CreateMovieDto } from '../../types/movie';
import { Info, Image, Users, Hash, PlayCircle, Save, ArrowLeft } from 'lucide-react';
import { FormSection, FormInput, FormSelect, FormTextarea } from '../Form/FormSection';
import { SingleSelectGrid } from '../Form/SingleSelectGrid';
import { MultipleSelectGrid } from '../Form/MultipleSelectGrid';

interface Props {
    formMethods: UseFormReturn<CreateMovieDto>;
    isEditing: boolean;
    directors: any[];
    actors: any[];
    genres: any[];
    onCancel: () => void;
    onSubmit: (data: CreateMovieDto) => Promise<void>;
    onAddDirector: () => void;
    onAddActor: () => void;
    onAddGenre: () => void;
}

export const MovieForm = ({
                              formMethods, isEditing, directors, actors, genres,
                              onCancel, onSubmit, onAddDirector, onAddActor, onAddGenre
                          }: Props) => {
    const { register, handleSubmit, watch, setValue } = formMethods;

    // Слідкуємо за значеннями для відображення вибору в грідах
    const selectedDirectorId = watch('directorId');
    const selectedGenreIds = watch('genreIds') || [];
    const selectedActorIds = watch('actorIds') || [];

    const toggleSelection = (id: string, field: 'genreIds' | 'actorIds') => {
        const current: string[] = (watch(field) as any) || [];
        const newValues = current.includes(id)
            ? current.filter(v => v !== id)
            : [...current, id];
        setValue(field, newValues as any);
    };

    return (
        <div className="animate-fade-in pb-20">
            <div className="flex items-center gap-6 mb-10">
                <button
                    onClick={onCancel}
                    className="bg-gray-800/50 p-4 rounded-2xl hover:bg-red-600 text-white transition-colors"
                >
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
                    <button
                        type="button"
                        onClick={(e) => void handleSubmit(onSubmit)(e)}
                        className="w-full bg-red-600 text-white py-6 rounded-4xl font-black uppercase text-xs shadow-xl hover:bg-red-700 active:scale-95 transition-all"
                    >
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
                            <SingleSelectGrid
                                title="Режисер"
                                items={directors}
                                selectedId={selectedDirectorId}
                                onSelect={(id) => setValue('directorId', id)}
                                onAdd={onAddDirector}
                                renderLabel={(d: any) => `${d.firstName} ${d.lastName}`}
                                accentColor="amber"
                                searchPlaceholder="Знайти режисера..."
                            />
                            <MultipleSelectGrid
                                title="Актори"
                                icon={<Users size={20}/>}
                                items={actors}
                                selectedIds={selectedActorIds.map(Number)}
                                onToggle={(id) => toggleSelection(id.toString(), 'actorIds')}
                                onAdd={onAddActor}
                                renderLabel={(a: any) => `${a.firstName} ${a.lastName}`}
                                color="amber"
                                itemsPerPage={6}
                                searchPlaceholder="Знайти актора..."
                            />
                        </FormSection>

                        <FormSection id="tax" title="Жанри" icon={Hash} iconColor="text-purple-500">
                            <MultipleSelectGrid
                                items={genres}
                                selectedIds={selectedGenreIds.map(Number)}
                                onToggle={(id) => toggleSelection(id.toString(), 'genreIds')}
                                onAdd={onAddGenre}
                                renderLabel={(g: any) => g.name || ''}
                                color="purple"
                                itemsPerPage={8}
                            />
                        </FormSection>
                    </form>
                </div>
            </div>
        </div>
    );
};