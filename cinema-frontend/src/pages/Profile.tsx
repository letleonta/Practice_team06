import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { UserService } from '../services/userService.ts';
import type { UserDto, UpdateProfileDto } from '../types/user';
import { Mail, Calendar, Camera, Loader2, LogOut, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/useAuthStore';

// Константа для шляху до сервера, щоб картинки відображались
const BASE_URL = "http://localhost:5144";

export const Profile = () => {
    const logout = useAuthStore(state => state.logout);

    // Стани для даних та завантаження
    const [user, setUser] = useState<UserDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

    // Налаштування форми
    const { register, handleSubmit, reset, formState: { isDirty } } = useForm<UpdateProfileDto>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Завантаження даних при старті
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await UserService.getProfile();
            setUser(data);

            // Заповнюємо форму початковими даними
            reset({
                firstName: data.firstName,
                lastName: data.lastName,
                birthDate: data.birthDate?.split('T')[0] // Перетворюємо DateTime у формат YYYY-MM-DD
            });
        } catch (err) {
            console.error("Помилка при отриманні профілю:", err);
        } finally {
            setLoading(false);
        }
    };

    // Обробка оновлення текстових даних
    const onUpdateSubmit = async (data: UpdateProfileDto) => {
        try {
            await UserService.updateProfile(data);
            alert("Дані успішно оновлено!");
            fetchProfile(); // Оновлюємо стейт, щоб скинути isDirty
        } catch (err) {
            alert("Помилка оновлення профілю");
        }
    };

    // Обробка завантаження аватарки
    const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUpdatingAvatar(true);
            const result = await UserService.uploadAvatar(file);

            // Оновлюємо тільки посилання на фото в поточному стейті
            if (user) {
                setUser({ ...user, avatarUrl: result.avatarUrl });
            }
            alert("Фото профілю оновлено!");
        } catch (err) {
            alert("Не вдалося завантажити фото");
        } finally {
            setIsUpdatingAvatar(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
            <Loader2 className="animate-spin text-red-600" size={48} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f1117] text-white p-6 md:p-12 font-sans flex flex-col items-center">
            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* ЛІВА ЧАСТИНА: Аватарка та основна інфа */}
                <div className="lg:col-span-1">
                    <div className="bg-[#1a1d26] p-10 rounded-[2.5rem] border border-gray-800 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>

                        <div
                            className="relative w-40 h-40 mx-auto mt-4 mb-6 group cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <img
                                src={user?.avatarUrl ? `${BASE_URL}${user.avatarUrl}` : "https://via.placeholder.com/150"}
                                className="w-full h-full rounded-full object-cover border-4 border-gray-900 shadow-2xl transition-all duration-300 group-hover:brightness-50"
                                alt="Аватар"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={32} className="text-white" />
                            </div>
                            {isUpdatingAvatar && (
                                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                    <Loader2 className="animate-spin text-red-600" />
                                </div>
                            )}
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={onAvatarChange}
                        />

                        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-1">
                            {user?.firstName} {user?.lastName}
                        </h2>
                        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-8">
                            <Mail size={14} /> {user?.email}
                        </div>

                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-900 text-gray-500 hover:bg-red-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest border border-gray-800"
                        >
                            <LogOut size={16} /> Вийти з системи
                        </button>
                    </div>
                </div>

                {/* ПРАВА ЧАСТИНА: Форма редагування */}
                <div className="lg:col-span-2 bg-[#1a1d26] p-10 md:p-14 rounded-[2.5rem] border border-gray-800 shadow-2xl relative">
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-10 flex items-center gap-4 border-l-4 border-red-600 pl-6">
                        Налаштування
                    </h3>

                    <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2 text-left">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-2">Ім'я</label>
                                <input
                                    {...register('firstName', { required: true })}
                                    className="w-full p-4 bg-gray-900 border border-gray-800 rounded-2xl outline-none focus:border-red-600 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-2">Прізвище</label>
                                <input
                                    {...register('lastName', { required: true })}
                                    className="w-full p-4 bg-gray-900 border border-gray-800 rounded-2xl outline-none focus:border-red-600 transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 text-left">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-2 block">Дата народження</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                                <input
                                    type="date"
                                    {...register('birthDate', { required: true })}
                                    className="w-full p-4 pl-14 bg-gray-900 border border-gray-800 rounded-2xl outline-none focus:border-red-600 transition-all text-white font-bold"
                                />
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-800/50">
                            <Button
                                type="submit"
                                disabled={!isDirty}
                                className={`w-full md:w-auto px-12 py-4 uppercase text-[11px] font-black tracking-widest transition-all ${!isDirty ? 'opacity-30 grayscale' : 'opacity-100'}`}
                            >
                                <Check size={18} className="mr-2" /> Зберегти зміни
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};