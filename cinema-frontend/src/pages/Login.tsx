import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import type { LoginDto } from '../types/auth';
import { useAuthStore } from '../store/useAuthStore';
import axios from 'axios';
import { Mail, Lock, LogIn } from 'lucide-react'; // Іконки для краси

const Login = () => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<LoginDto>();

    const onSubmit = async (data: LoginDto) => {
        try {
            setError(null);

            // 1. РОБИМО ЗАПИТ ДО БЕКЕНДУ (це те, що було пропущено)
            const response = await api.post('/auth/login', data);

            const loginData = response.data; // Отримуємо { token, email, expiration }

            // 2. ПЕРЕВІРЯЄМО ЧИ Є ТОКЕН
            if (loginData && loginData.token) {
                // Викликаємо оновлений setAuth, який сам розшифрує роль з токена
                setAuth(loginData.token);

                // Перенаправляємо на головну
                navigate('/');
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    setError('Невірний email або пароль');
                } else {
                    setError('Сервер не відповідає. Перевірте з’єднання.');
                }
            } else {
                setError('Виникла помилка. Спробуйте пізніше.');
            }
            console.error("Login error:", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f1117] px-4">
            <div className="max-w-md w-full bg-[#1a1d26] p-8 rounded-2xl shadow-2xl border border-gray-800">
                {/* Логотип або Назва */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-red-600 tracking-tighter mb-2">CINEMA_PRO</h1>
                    <p className="text-gray-400 text-sm">Увійдіть, щоб бронювати квитки</p>
                </div>

                <h2 className="text-xl font-bold text-white mb-6">Вхід</h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center animate-pulse">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Поле Email */}
                    <div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                {...register('email', {
                                    required: 'Введіть вашу пошту',
                                    pattern: { value: /^\S+@\S+$/i, message: 'Невірний формат пошти' }
                                })}
                                type="email"
                                placeholder="Email"
                                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 text-white border ${errors.email ? 'border-red-500' : 'border-gray-700'} focus:border-red-500 outline-none transition-all`}
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>}
                    </div>

                    {/* Поле Пароль */}
                    <div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                {...register('password', { required: 'Введіть пароль' })}
                                type="password"
                                placeholder="Пароль"
                                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 text-white border ${errors.password ? 'border-red-500' : 'border-gray-700'} focus:border-red-500 outline-none transition-all`}
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>}
                    </div>

                    <button
                        disabled={isSubmitting}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <LogIn size={20} />
                                Увійти
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                    <p className="text-gray-400 text-sm">
                        Немає акаунту?{' '}
                        <Link to="/register" className="text-red-500 font-bold hover:text-red-400 transition-colors">
                            Зареєструватися
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;