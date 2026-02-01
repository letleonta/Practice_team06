import { useForm } from 'react-hook-form';
import { SessionService } from '../../services/session.service';
import type {CreateSessionDto} from '../../types/session';
import { Calendar, Plus } from 'lucide-react';

const AdminSessions = () => {
    const { register, handleSubmit, reset } = useForm<CreateSessionDto>();

    const onSubmit = async (data: CreateSessionDto) => {
        try {
            await SessionService.create(data);
            alert("Сеанс додано!");
            reset();
        } catch (err: any) {
            alert(err.response?.data?.message || "Помилка");
        }
    };

    return (
        <div className="max-w-2xl">
            <div className="bg-[#1a1d26] p-8 rounded-3xl border border-gray-800 shadow-xl">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Calendar className="text-red-600" /> Створити сеанс
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input {...register('movieId')} type="number" placeholder="ID Фільму" className="p-3 bg-gray-900 border border-gray-700 rounded-xl outline-none focus:border-red-500" />
                        <input {...register('hallId')} type="number" placeholder="ID Залу" className="p-3 bg-gray-900 border border-gray-700 rounded-xl outline-none focus:border-red-500" />
                    </div>
                    <input {...register('languageId')} type="number" placeholder="ID Мови" className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl outline-none focus:border-red-500" />
                    <input {...register('startTime')} type="datetime-local" className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl outline-none focus:border-red-500 text-white" />

                    <button className="w-full bg-red-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all">
                        <Plus size={20}/> Зберегти сеанс
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminSessions;