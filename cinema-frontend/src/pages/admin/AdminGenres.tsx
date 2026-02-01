import { useForm } from 'react-hook-form';
import api from '../../api/axiosInstance';
import { Tag } from 'lucide-react';

const AdminGenres = () => {
    const { register, handleSubmit, reset } = useForm<{ name: string }>();

    const onSubmit = async (data: { name: string }) => {
        try {
            await api.post('/genres', data);
            alert('Жанр додано!');
            reset();
        } catch (err) { alert('Помилка'); }
    };

    return (
        <div className="max-w-md bg-[#1a1d26] p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Tag className="text-red-600"/> Додати жанр</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input {...register('name', { required: true })} placeholder="Назва жанру (напр. Комедія)" className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:border-red-500" />
                <button className="w-full bg-red-600 py-3 rounded-xl font-bold">Зберегти</button>
            </form>
        </div>
    );
};
export default AdminGenres;