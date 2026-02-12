import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { HallDto } from '../../types/hall';
import type { LanguageDto } from '../../types/language';
import type { MovieDto } from '../../types/movie';
import type { CreateSessionDto, SessionDto } from '../../types/session';
import { Calendar, Repeat, Plus, Loader2, MapPin, Languages, Save, X, AlertCircle } from 'lucide-react';

interface Props {
    movie: MovieDto;
    halls: HallDto[];
    languages: LanguageDto[];
    initialData?: SessionDto | null;
    onSubmit: (sessions: CreateSessionDto[]) => Promise<void>;
    onUpdate?: (id: number, data: CreateSessionDto) => Promise<void>;
    onCancelEdit?: () => void;
}

interface SessionFormValues {
    hallId: string;
    languageId: string;
    date: string;
}

const DAYS_OF_WEEK = [
    { id: 1, label: 'Пн' }, { id: 2, label: 'Вт' }, { id: 3, label: 'Ср' },
    { id: 4, label: 'Чт' }, { id: 5, label: 'Пт' }, { id: 6, label: 'Сб' }, { id: 0, label: 'Нд' }
];

export const SessionCreateForm = ({ movie, halls, languages, initialData, onSubmit, onUpdate, onCancelEdit }: Props) => {
    const [isRecurring, setIsRecurring] = useState(false);
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [endDate, setEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SessionFormValues>();

    // --- ОБЧИСЛЕННЯ ДАТ ДЛЯ ОБМЕЖЕНЬ ---

    const now = new Date();
    // Вираховуємо зміщення часового поясу (у хвилинах), щоб отримати локальний час в ISO
    const tzOffset = now.getTimezoneOffset() * 60000;

    // Перевіряємо, чи є дати прокату. Якщо немає — ставимо дефолтні значення.
    const movieStart = movie.startDate ? new Date(movie.startDate) : new Date(0);
    const movieEnd = movie.endDate ? new Date(movie.endDate) : new Date(now.getFullYear() + 10, 0, 1);
    movieEnd.setHours(23, 59, 59, 999);

    const effectiveMinDate = now > movieStart ? now : movieStart;

    const toLocalISOString = (date: Date) => {
        return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    };

    const minDateTimeString = toLocalISOString(effectiveMinDate);
    const maxDateTimeString = toLocalISOString(movieEnd);

    const minDateString = effectiveMinDate.toISOString().split('T')[0];
    const maxDateString = movieEnd.toISOString().split('T')[0];


    useEffect(() => {
        if (initialData) {
            // РЕДАГУВАННЯ
            setValue('hallId', String(initialData.hallId));

            const lang = languages.find(l => l.name === initialData.languageName);
            if (lang) {
                setValue('languageId', String(lang.id));
            }

            const dateObj = new Date(initialData.startTime);
            setValue('date', toLocalISOString(dateObj));

            setIsRecurring(false);
        } else {
            reset();
            setIsRecurring(false);

            let defaultStartDate = new Date();

            if (now < movieStart) {
                defaultStartDate = new Date(movieStart);
                defaultStartDate.setHours(9, 0, 0, 0);
            } else {
                defaultStartDate = new Date();
                defaultStartDate.setMinutes(0, 0, 0);
                defaultStartDate.setHours(defaultStartDate.getHours() + 1);
            }

            if (defaultStartDate > movieEnd) {
                defaultStartDate = new Date(movieEnd);
                defaultStartDate.setHours(23, 0, 0, 0);
            }
            if (defaultStartDate < effectiveMinDate) {
                defaultStartDate = new Date(effectiveMinDate);
                defaultStartDate.setMinutes(defaultStartDate.getMinutes() + 5);
            }


            setValue('date', toLocalISOString(defaultStartDate));


            if (movie.endDate) {
                setEndDate(movie.endDate.split('T')[0]);
            }
        }
    }, [initialData, setValue, reset, languages, movie]); // Додали movie в залежності

    const createDateAsUTC = (dateString: string): Date => {
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - userTimezoneOffset);
    };

    const generateSessions = (formData: SessionFormValues): CreateSessionDto[] => {
        const sessions: CreateSessionDto[] = [];
        const start = new Date(formData.date);
        const timePart = formData.date.split('T')[1] || '00:00:00';

        const correctDate = createDateAsUTC(formData.date);

        const baseDto: CreateSessionDto = {
            movieId: movie.id,
            hallId: Number(formData.hallId),
            languageId: Number(formData.languageId),
            startTime: correctDate.toISOString()
        };

        if (!isRecurring || initialData) {
            sessions.push(baseDto);
            return sessions;
        }

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        if (isNaN(end.getTime()) || end < start) return [baseDto];

        const current = new Date(start);

        while (current <= end) {
            if (current > movieEnd) break;

            if (selectedDays.includes(current.getDay())) {
                const dateStr = current.toISOString().split('T')[0];
                const fullDateTimeString = `${dateStr}T${timePart}`;
                const sessionDateCorrected = createDateAsUTC(fullDateTimeString);

                sessions.push({
                    ...baseDto,
                    startTime: sessionDateCorrected.toISOString()
                });
            }
            current.setDate(current.getDate() + 1);
        }

        return sessions;
    };

    const handleFormSubmit = async (data: SessionFormValues) => {
        setIsLoading(true);
        try {
            const sessionsPayload = generateSessions(data);

            if (sessionsPayload.length === 0) {
                alert("Не вдалося створити сеанси. Перевірте дати.");
                setIsLoading(false);
                return;
            }

            if (initialData && onUpdate) {
                await onUpdate(initialData.id, sessionsPayload[0]);
            } else {
                if (isRecurring && (selectedDays.length === 0 || !endDate)) {
                    alert("Оберіть дні тижня та дату завершення");
                    setIsLoading(false);
                    return;
                }
                await onSubmit(sessionsPayload);
                setSelectedDays([]);
                setIsRecurring(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleDay = (dayId: number) => {
        setSelectedDays(prev =>
            prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
        );
    };

    return (
        <div className={`p-6 rounded-4xl border shadow-xl animate-fade-in transition-colors ${initialData ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[#1a1d26] border-gray-800'}`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2 text-white">
                    {initialData ? (
                        <><Save className="text-amber-500" /> Редагувати сеанс №{initialData.id} </>
                    ) : (
                        <><Calendar className="text-red-600" /> Додати сеанс: <span className="text-red-500">{movie.title}</span></>
                    )}
                </h2>

                {initialData ? (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        className="text-xs px-3 py-1.5 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center gap-2 transition-all border border-gray-700 hover:border-gray-500"
                    >
                        <X size={12} /> Скасувати
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsRecurring(!isRecurring)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-2
                        ${isRecurring ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}
                    >
                        <Repeat size={12} />
                        {isRecurring ? 'Періодичний розклад' : 'Один сеанс'}
                    </button>
                )}
            </div>

            <div className="mb-4 text-xs text-gray-500 font-mono bg-black/20 p-2 rounded-lg border border-gray-800">
                <p>
                    Період прокату: <span className="text-white">
                        {movie.startDate ? new Date(movie.startDate).toLocaleDateString() : 'Не вказано'}
                    </span> — <span className="text-white">
                        {movie.endDate ? new Date(movie.endDate).toLocaleDateString() : 'Не вказано'}
                    </span>
                </p>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Зал</label>
                        <div className="relative">
                            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                            <select {...register('hallId', { required: true })} className="w-full pl-9 pr-3 py-3 bg-gray-900 border border-gray-700 rounded-xl outline-none focus:border-red-500 cursor-pointer text-sm text-white appearance-none">
                                <option value="">Оберіть зал</option>
                                {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Мова / Тип</label>
                        <div className="relative">
                            <Languages size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                            <select {...register('languageId', { required: true })} className="w-full pl-9 pr-3 py-3 bg-gray-900 border border-gray-700 rounded-xl outline-none focus:border-red-500 cursor-pointer text-sm text-white appearance-none">
                                <option value="">Оберіть мову</option>
                                {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">
                            {isRecurring && !initialData ? 'Дата та час першого' : 'Дата та час'}
                        </label>
                        <input
                            type="datetime-local"
                            min={minDateTimeString}
                            max={maxDateTimeString}
                            {...register('date', {
                                required: true,
                                validate: (value) => {
                                    const selected = new Date(value);
                                    // Дозволяємо похибку в 1 хвилину для "зараз"
                                    if (selected < effectiveMinDate && (effectiveMinDate.getTime() - selected.getTime()) > 60000) return "Дата не може бути в минулому або до початку прокату";
                                    if (selected > movieEnd) return "Дата виходить за межі періоду прокату";
                                    return true;
                                }
                            })}
                            className={`w-full p-3 bg-gray-900 border rounded-xl outline-none focus:border-red-500 text-sm text-white [color-scheme:dark]
                                ${errors.date ? 'border-red-500' : 'border-gray-700'}`}
                        />
                        {errors.date && (
                            <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1">
                                <AlertCircle size={12} /> {typeof errors.date.message === 'string' ? errors.date.message : "Некоректна дата"}
                            </p>
                        )}
                    </div>
                </div>

                {isRecurring && !initialData && (
                    <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-xl space-y-3 animate-fade-in">
                        <div>
                            <label className="block text-indigo-300 text-[10px] font-bold uppercase mb-2">Дні тижня</label>
                            <div className="flex gap-2 flex-wrap">
                                {DAYS_OF_WEEK.map(day => (
                                    <button
                                        key={day.id}
                                        type="button"
                                        onClick={() => toggleDay(day.id)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all
                                        ${selectedDays.includes(day.id)
                                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-110'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-indigo-300 text-[10px] font-bold uppercase mb-1">Дата завершення повторів</label>
                            <input
                                type="date"
                                min={minDateString}
                                max={maxDateString}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 [color-scheme:dark]"
                            />
                            <p className="text-[10px] text-indigo-300/50 mt-1">
                                Не пізніше: {movie.endDate ? new Date(movie.endDate).toLocaleDateString() : 'Не вказано'}
                            </p>
                        </div>
                    </div>
                )}

                <button
                    disabled={isLoading}
                    className={`w-full font-black p-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50
                    ${initialData
                        ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-900/20'
                        : 'bg-white hover:bg-red-600 hover:text-white text-black'}`}
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : (
                        initialData ? <Save size={18} /> : <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    )}
                    {initialData ? 'ЗБЕРЕГТИ ЗМІНИ' : (isRecurring ? 'СТВОРИТИ РОЗКЛАД' : 'ДОДАТИ СЕАНС')}
                </button>
            </form>
        </div>
    );
};