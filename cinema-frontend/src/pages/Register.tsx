import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/auth.service'; // Імпортуємо сервіс
import type { RegisterDto } from '../types/auth';
import axios from 'axios';
import { Mail, Lock, Calendar, ChevronRight } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterDto>();

    const onSubmit = async (data: RegisterDto) => {
        try {
            setError(null);

            const result = await AuthService.register(data);

            if (result.succeeded) {
                alert('Реєстрація успішна! Ви можете увійти.');
                navigate('/login');
            } else {
                setError(result.errors?.[0] || 'Помилка реєстрації');
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const apiErrors = err.response?.data?.errors;
                setError(Array.isArray(apiErrors) ? apiErrors[0] : 'Помилка реєстрації. Перевірте дані.');
            } else {
                setError('Не вдалося з’єднатися з сервером');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f1117] px-4 font-sans">
            <div className="max-w-md w-full bg-[#1a1d26] p-8 rounded-2xl shadow-2xl border border-gray-800">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-red-600 tracking-tighter mb-2 italic">JOIN_CINEMA</h1>
                    <p className="text-gray-400 text-sm font-medium">Створіть акаунт для доступу до бронювання</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-xl mb-6 text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Ім'я та Прізвище */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <input
                                {...register('firstName', { required: "Обов'язково" })}
                                placeholder="Ім'я"
                                className={`w-full p-3.5 rounded-xl bg-gray-900 text-white border ${errors.firstName ? 'border-red-500' : 'border-gray-700'} focus:border-red-500 outline-none transition-all text-sm`}
                            />
                        </div>
                        <div className="relative">
                            <input
                                {...register('lastName', { required: "Обов'язково" })}
                                placeholder="Прізвище"
                                className={`w-full p-3.5 rounded-xl bg-gray-900 text-white border ${errors.lastName ? 'border-red-500' : 'border-gray-700'} focus:border-red-500 outline-none transition-all text-sm`}
                            />
                        </div>
                    </div>

                    {/* Дата народження */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            {...register('birthDate', { required: "Вкажіть дату народження" })}
                            type="date"
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none transition-all text-sm"
                        />
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            {...register('email', { required: "Введіть Email" })}
                            type="email"
                            placeholder="Електронна пошта"
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none transition-all text-sm"
                        />
                    </div>

                    {/* Пароль */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            {...register('password', { required: "Вигадайте пароль", minLength: { value: 6, message: "Мін. 6 символів" } })}
                            type="password"
                            placeholder="Пароль"
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-red-500 outline-none transition-all text-sm"
                        />
                    </div>

                    <button
                        disabled={isSubmitting}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 uppercase text-xs tracking-widest mt-4"
                    >
                        {isSubmitting ? 'Обробка...' : (
                            <>
                                Зареєструватися
                                <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-gray-400 text-center mt-8 text-sm font-medium">
                    Вже маєте акаунт? <Link to="/login" className="text-red-500 font-bold hover:text-red-400 transition-colors uppercase text-xs tracking-wider ml-1">Увійти</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;