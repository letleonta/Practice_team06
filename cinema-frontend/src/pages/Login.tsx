import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import type { LoginDto } from '../types/auth';
import { useAuthStore } from '../store/useAuthStore';
import axios from 'axios';
import { Mail, Lock, LogIn, KeyRound, X, Loader2 } from 'lucide-react';
import { notify } from '../utils/toast';
import { Button } from "../components/ui/Button";

const Login = () => {
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();

    const [error, setError] = useState<string | null>(null);
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [isForgotLoading, setIsForgotLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<LoginDto>({
        mode: 'onBlur'
    });

    const {
        register: registerForgot,
        handleSubmit: handleForgotSubmit,
        reset: resetForgot
    } = useForm<{ email: string }>();

    const onSubmit = async (data: LoginDto) => {
        try {
            setError(null);
            const loginData = await AuthService.login(data);

            if (loginData && loginData.token) {
                setAuth(loginData.token);
                notify.success('Вітаємо у системі!');
                navigate('/');
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    setError('Невірний email або пароль');
                } else {
                    setError(err.response?.data?.message || 'Сервер не відповідає');
                }
            } else {
                setError('Виникла помилка. Спробуйте пізніше.');
            }
        }
    };

    const onForgotPassword = async (data: { email: string }) => {
        try {
            setIsForgotLoading(true);
            const result = await AuthService.forgotPassword(data.email);
            notify.success("Інструкції надіслано! (Перевірте консоль для токена)");
            console.log("Reset Token:", result.resetToken);
            setIsForgotModalOpen(false);
            resetForgot();
        } catch (err: any) {
            notify.error("Користувача з такою поштою не знайдено");
        } finally {
            setIsForgotLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f1117] px-4 font-sans text-white">
            <div className="max-w-md w-full bg-[#1a1d26] p-8 rounded-[2.5rem] shadow-2xl border border-gray-800">

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-red-600 tracking-tighter mb-2">CINEMA</h1>
                    <p className="text-gray-400 text-sm font-medium">Авторизація користувача</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl mb-6 text-sm text-center font-bold animate-in fade-in zoom-in-95">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Email */}
                    <div className="flex flex-col gap-1">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors" size={20} />
                            <input
                                {...register('email', {
                                    required: 'Введіть вашу пошту',
                                    pattern: { value: /^\S+@\S+$/i, message: 'Невірний формат пошти' }
                                })}
                                type="email"
                                placeholder="Email"
                                className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-900 border ${errors.email ? 'border-red-500' : 'border-gray-800'} focus:border-red-600 outline-none transition-all font-bold`}
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-[10px] font-black uppercase ml-2 tracking-widest">{errors.email.message}</p>}
                    </div>

                    {/* Пароль */}
                    <div className="flex flex-col gap-1">
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors" size={20} />
                            <input
                                {...register('password', { required: 'Введіть пароль' })}
                                type="password"
                                placeholder="Пароль"
                                className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-900 border ${errors.password ? 'border-red-500' : 'border-gray-800'} focus:border-red-600 outline-none transition-all font-bold`}
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-[10px] font-black uppercase ml-2 tracking-widest">{errors.password.message}</p>}
                    </div>

                    <div className="text-right px-2">
                        <button
                            type="button"
                            onClick={() => setIsForgotModalOpen(true)}
                            className="text-[11px] font-black uppercase text-gray-500 hover:text-red-500 transition-colors tracking-widest"
                        >
                            Забули пароль?
                        </button>
                    </div>

                    <button
                        disabled={isSubmitting}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 uppercase text-sm tracking-[0.2em] mt-2"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <LogIn size={20} />
                                Увійти
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                    <p className="text-gray-400 text-xs uppercase font-bold tracking-widest">
                        Немає акаунту?{' '}
                        <Link to="/register" className="text-red-500 font-black hover:text-red-400 transition-colors ml-1">
                            Реєстрація
                        </Link>
                    </p>
                </div>
            </div>

            {/* ПОПАП ВІДНОВЛЕННЯ ПАРОЛЯ */}
            {isForgotModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in" onClick={() => setIsForgotModalOpen(false)}></div>
                    <div className="bg-[#1a1d26] w-full max-w-md p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl relative z-10 animate-in zoom-in-95">
                        <button onClick={() => setIsForgotModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24} /></button>

                        <div className="mb-8 text-center">
                            <div className="bg-red-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <KeyRound className="text-red-600" size={32} />
                            </div>
                            <h4 className="text-2xl font-black uppercase tracking-tighter">Відновлення</h4>
                            <p className="text-gray-500 text-xs mt-2 uppercase font-bold tracking-widest">Введіть ваш Email для скидання</p>
                        </div>

                        <form onSubmit={handleForgotSubmit(onForgotPassword)} className="space-y-4">
                            <input
                                type="email"
                                {...registerForgot('email', { required: true })}
                                placeholder="Введіть ваш email"
                                className="w-full p-4 bg-[#0f1117] border border-gray-800 rounded-2xl outline-none focus:border-red-600 text-white font-bold"
                            />
                            <Button
                                type="submit"
                                isLoading={isForgotLoading}
                                className="w-full py-5 uppercase text-[10px] font-black tracking-widest mt-2"
                            >
                                Надіслати запит
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;