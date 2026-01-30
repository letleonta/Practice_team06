import { useForm } from 'react-hook-form';
import api from '../../api/axiosInstance';
import { UserCheck } from 'lucide-react';

const AdminDirectors = () => {
    const { register, handleSubmit, reset } = useForm<{ name: string }>();

    const onSubmit = async (data: { name: string }) => {
        try {
            await api.post('/directors', data);
            alert('Режисера додано!');
            reset();
        } catch (err: any) {
            // Виводимо в консоль для розробника
            console.error("Деталі помилки:", err.response?.data);

            // Показуємо конкретне повідомлення
            const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0] || "Невідома помилка";
            alert('Сталася помилка: ' + errorMessage);
        }
    };

    return (
        <div className="max-w-md bg-[#1a1d26] p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><UserCheck className="text-red-600"/> Додати режисера</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input {...register('name', { required: true })} placeholder="ПІБ Режисера" className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:border-red-500" />
                <button className="w-full bg-red-600 py-3 rounded-xl font-bold">Зберегти</button>
            </form>
        </div>
    );
};
export default AdminDirectors;