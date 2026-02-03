import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import type { RegisterDto } from '../types/auth';
import { Mail, Lock, Calendar, ChevronRight, AlertCircle } from 'lucide-react';
import { notify } from '../utils/toast';
import { useAuthStore } from '../store/useAuthStore';

const FieldError = ({ message }: { message?: string }) => {
    if (!message) return null;

    return (
        <div className="mt-1.5 ml-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-red-500 text-[12px] font-bold uppercase tracking-tight flex items-center gap-1.5 leading-tight">
                <AlertCircle size={14} className="min-w-3.5" />
                {message}
            </p>
        </div>
    );
};

const Register = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const { setAuth } = useAuthStore();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<RegisterDto>({
        mode: 'onChange'
    });

    const onSubmit = async (data: RegisterDto) => {
        try {
            setError(null);
            const result = await AuthService.register(data);

            if (result.succeeded && result.response) {
                const token = result.response.token;

                setAuth(token);

                notify.success('Реєстрація успішна! Ласкаво просимо.');

                navigate('/');
            } else {
                setError(result.errors?.[0] || 'Помилка реєстрації');
            }
        } catch (err: unknown) {
            notify.error('Помилка з’єднання з сервером');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f1117] px-4 font-sans text-white">
            <div className="max-w-md w-full bg-[#1a1d26] p-8 rounded-[2.5rem] shadow-2xl border border-gray-800 transition-all duration-300">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-red-600 tracking-tighter mb-2">CINEMA</h1>
                    <p className="text-gray-400 text-sm font-medium">Створіть акаунт для доступу до бронювання</p>
                </div>

                {/* Загальна помилка сервера */}
                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-2xl text-sm text-center font-bold animate-in zoom-in-95 duration-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
                    {/* Ім'я та Прізвище */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <input
                                {...register('firstName', { required: "Ім'я обов'язкове" })}
                                placeholder="Ім'я"
                                className={`w-full p-4 rounded-2xl bg-gray-900 border ${errors.firstName ? 'border-red-500' : 'border-gray-800'} focus:border-red-600 outline-none transition-all text-sm`}
                            />
                            <FieldError message={errors.firstName?.message} />
                        </div>
                        <div className="flex flex-col">
                            <input
                                {...register('lastName', { required: "Прізвище обов'язкове" })}
                                placeholder="Прізвище"
                                className={`w-full p-4 rounded-2xl bg-gray-900 border ${errors.lastName ? 'border-red-500' : 'border-gray-800'} focus:border-red-600 outline-none transition-all text-sm`}
                            />
                            <FieldError message={errors.lastName?.message} />
                        </div>
                    </div>

                    {/* Дата народження */}
                    <div className="flex flex-col">
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                {...register('birthDate', { required: "Вкажіть дату народження" })}
                                type="date"
                                className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-900 border ${errors.birthDate ? 'border-red-500' : 'border-gray-800'} focus:border-red-600 outline-none transition-all text-sm`}
                            />
                        </div>
                        <FieldError message={errors.birthDate?.message} />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                {...register('email', {
                                    required: "Введіть Email",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Невірний формат пошти"
                                    }
                                })}
                                type="email"
                                placeholder="Електронна пошта"
                                className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-900 border ${errors.email ? 'border-red-500' : 'border-gray-800'} focus:border-red-600 outline-none transition-all text-sm`}
                            />
                        </div>
                        <FieldError message={errors.email?.message} />
                    </div>

                    {/* Пароль */}
                    <div className="flex flex-col">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                {...register('password', {
                                    required: "Вигадайте пароль",
                                    minLength: { value: 6, message: "Мінімум 6 символів" },
                                    validate: {
                                        hasUpper: (v) => /[A-Z]/.test(v) || "Має бути велика літера",
                                        hasNumber: (v) => /[0-9]/.test(v) || "Має бути цифра",
                                        hasSpecial: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) || "Додайте спецсимвол (!@#_)"
                                    }
                                })}
                                type="password"
                                placeholder="Пароль"
                                className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-900 border ${errors.password ? 'border-red-500' : 'border-gray-800'} focus:border-red-600 outline-none transition-all text-sm`}
                            />
                        </div>
                        <FieldError message={errors.password?.message} />
                    </div>

                    <button
                        disabled={isSubmitting}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 uppercase text-sm tracking-widest mt-2"
                    >
                        {isSubmitting ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
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