import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import type {RegisterDto} from '../types/auth';
import axios from 'axios';

const Register = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { isSubmitting } } = useForm<RegisterDto>();

    const onSubmit = async (data: RegisterDto) => {
        try {
            setError(null);
            // Відправка даних на твій AuthController [HttpPost("register")]
            await api.post('/auth/register', data);

            alert('Реєстрація успішна! Тепер ви можете увійти.');
            navigate('/login');
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                // Виводимо помилку від бекенда (наприклад, "Email вже зайнятий")
                setError(err.response?.data?.errors?.[0] || 'Помилка реєстрації. Перевірте дані.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f1117] px-4">
            <div className="max-w-md w-full bg-[#1a1d26] p-8 rounded-xl shadow-2xl border border-gray-800">
                <h2 className="text-3xl font-bold text-white text-center mb-8">Реєстрація</h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            {...register('firstName', { required: true })}
                            placeholder="Ім'я"
                            className="w-full p-3 rounded-lg bg-[#242834] text-white border border-gray-700 focus:border-red-500 outline-none transition"
                        />
                        <input
                            {...register('lastName', { required: true })}
                            placeholder="Прізвище"
                            className="w-full p-3 rounded-lg bg-[#242834] text-white border border-gray-700 focus:border-red-500 outline-none transition"
                        />
                    </div>

                    <input
                        {...register('birthDate', { required: true })}
                        type="date"
                        className="w-full p-3 rounded-lg bg-[#242834] text-white border border-gray-700 focus:border-red-500 outline-none transition"
                    />

                    <input
                        {...register('email', { required: true })}
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 rounded-lg bg-[#242834] text-white border border-gray-700 focus:border-red-500 outline-none transition"
                    />

                    <input
                        {...register('password', { required: true, minLength: 6 })}
                        type="password"
                        placeholder="Пароль (мін. 6 символів)"
                        className="w-full p-3 rounded-lg bg-[#242834] text-white border border-gray-700 focus:border-red-500 outline-none transition"
                    />

                    <button
                        disabled={isSubmitting}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 mt-2"
                    >
                        {isSubmitting ? 'Створення...' : 'Зареєструватися'}
                    </button>
                </form>

                <p className="text-gray-400 text-center mt-6 text-sm">
                    Вже маєте акаунт? <Link to="/login" className="text-red-500 hover:underline">Увійти</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;