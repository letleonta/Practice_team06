import { useForm } from 'react-hook-form';
import { Plus, Calendar, MapPin, Languages } from 'lucide-react';
import type {MovieDto} from "../types/movie.ts";
import type {HallDto} from "../types/hall.ts";
import type {LanguageDto} from "../types/language.ts";
import type {CreateSessionDto} from "../types/session.ts";

interface Props {
    movie: MovieDto;
    halls: HallDto[];
    languages: LanguageDto[];
    onSubmit: (data: CreateSessionDto) => Promise<void>;
}

export const SessionCreateForm = ({ movie, halls, languages, onSubmit }: Props) => {
    const { register, handleSubmit, reset } = useForm<CreateSessionDto>();

    const handleFormSubmit = async (data: CreateSessionDto) => {
        await onSubmit(data);
        reset();
    };

    return (
        <div className="bg-[#1a1d26] p-6 rounded-4xl border border-gray-800 shadow-xl animate-fade-in">
            <h2 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
                <Calendar className="text-red-600" /> Додати сеанс: <span className="text-red-500">{movie.title}</span>
            </h2>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Зал</label>
                    <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <select {...register('hallId', { required: true })} className="w-full pl-9 pr-3 py-3 bg-gray-900 border border-gray-700 rounded-xl outline-none focus:border-red-500 cursor-pointer text-sm">
                            <option value="">Оберіть зал</option>
                            {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Мова / Тип</label>
                    <div className="relative">
                        <Languages size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <select {...register('languageId', { required: true })} className="w-full pl-9 pr-3 py-3 bg-gray-900 border border-gray-700 rounded-xl outline-none focus:border-red-500 cursor-pointer text-sm">
                            <option value="">Оберіть мову</option>
                            {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 ml-1 uppercase">Дата і час</label>
                    <input
                        type="datetime-local"
                        {...register('startTime', { required: true })}
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl outline-none focus:border-red-500 text-sm"
                    />
                </div>

                <button className="w-full bg-white text-black font-black p-3.5 rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 group">
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" /> ДОДАТИ
                </button>
            </form>
        </div>
    );
};