import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { UserService } from '../services/user.service.ts';
import { AuthService } from '../services/auth.service';
import type { UserDto, UpdateProfileDto } from '../types/user';
import type { ChangePasswordDto, ChangeEmailDto } from '../types/auth';
import {
    Calendar, Camera, Loader2, LogOut, Check, KeyRound, X,
    Pencil, User as UserIcon, AtSign, Trash2, Upload
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/useAuthStore';
import { notify } from '../utils/toast';

const BASE_URL = "http://localhost:5144";

export const Profile = () => {
    const { logout, setAuth, updateUser } = useAuthStore();

    const [user, setUser] = useState<UserDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

    const [isPassModalOpen, setIsPassModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false); // НОВИЙ СТАН
    const [isActionLoading, setIsActionLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { isDirty } } = useForm<UpdateProfileDto>();
    const { register: regPass, handleSubmit: handlePassSubmit, reset: resetPass} = useForm<ChangePasswordDto>({ mode: 'onChange' });
    const { register: regEmail, handleSubmit: handleEmailSubmit, reset: resetEmail } = useForm<ChangeEmailDto>();

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await UserService.getProfile();
            setUser(data);
            updateUser({ firstName: data.firstName, avatarUri: data.avatarUri });
            reset({
                firstName: data.firstName,
                lastName: data.lastName,
                birthDate: data.birthDate?.split('T')[0]
            });
        } catch (err) {
            console.error("Failed to fetch profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const onUpdateSubmit = async (data: UpdateProfileDto) => {
        try {
            await UserService.updateProfile(data);
            notify.success("Дані оновлено!");
            setIsEditing(false);
            fetchProfile();
        } catch (err) {
            console.error(err);
            notify.error("Помилка оновлення");
        }
    };

    const handleDeleteAvatar = async () => {
        try {
            setIsActionLoading(true);
            await UserService.deleteAvatar();
            setUser(prev => prev ? { ...prev, avatarUri: undefined } : null);
            updateUser({ avatarUri: undefined });
            notify.success("Фото видалено");

            setIsDeleteConfirmOpen(false);
            setIsAvatarModalOpen(false);
        } catch (err) {
            console.error(err);
            notify.error("Помилка видалення");
        } finally {
            setIsActionLoading(false);
        }
    };

    const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setIsUpdatingAvatar(true);
            setIsActionLoading(true);
            const result = await UserService.uploadAvatar(file);
            setUser(prev => prev ? { ...prev, avatarUri: result.avatarUri } : null);
            updateUser({ avatarUri: result.avatarUri });
            notify.success("Аватар оновлено");
            setIsAvatarModalOpen(false);
        } catch (err) {
            console.error(err);
            notify.error("Помилка завантаження");
        } finally {
            setIsUpdatingAvatar(false);
            setIsActionLoading(false);
        }
    };

    const onChangePassword = async (data: ChangePasswordDto) => {
        try {
            setIsActionLoading(true);
            await AuthService.changePassword(data);
            notify.success("Пароль змінено!");
            setIsPassModalOpen(false);
            resetPass();
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                notify.error(err.response?.data?.message || "Помилка пароля");
            }
        } finally {
            setIsActionLoading(false);
        }
    };

    const onChangeEmail = async (data: ChangeEmailDto) => {
        try {
            setIsActionLoading(true);
            const response = await AuthService.changeEmail(data);
            if (response.token) setAuth(response.token);
            notify.success("Пошту змінено!");
            setIsEmailModalOpen(false);
            fetchProfile();
            resetEmail();
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                notify.error(err.response?.data?.message || "Помилка пошти");
            }
        } finally {
            setIsActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
            <Loader2 className="animate-spin text-red-600" size={48} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f1117] text-white p-6 md:p-12 font-sans flex flex-col items-center">
            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

                {/* ЛІВА ПАНЕЛЬ */}
                <div className="lg:col-span-1">
                    <div className="bg-[#1a1d26] p-10 rounded-[2.5rem] border border-gray-800 text-center shadow-2xl relative overflow-hidden flex flex-col items-center">
                        <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>

                        <div className="relative w-40 h-40 mt-4 mb-8 group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
                            <div className={`absolute inset-0 rounded-full border-4 border-gray-900 bg-[#0f1117] flex flex-col items-center justify-center transition-all duration-300 ${!user?.avatarUri ? 'opacity-100' : 'opacity-0'}`}>
                                <UserIcon size={50} className="text-gray-700 group-hover:text-red-600 transition-colors" />
                                <span className="text-[10px] font-black uppercase mt-2 text-gray-600 tracking-widest">Змінити фото</span>
                            </div>

                            {user?.avatarUri && (
                                <img src={`${BASE_URL}${user.avatarUri}`} className="w-full h-full rounded-full object-cover border-4 border-gray-900 shadow-2xl group-hover:brightness-50 transition-all" alt="Avatar" />
                            )}

                            <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${isUpdatingAvatar ? 'opacity-100 bg-black/60 rounded-full' : 'opacity-0 group-hover:opacity-100'}`}>
                                {isUpdatingAvatar ? <Loader2 className="animate-spin text-red-600" size={32} /> : <Camera size={32} className="text-white" />}
                            </div>
                        </div>

                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onAvatarChange} />

                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 leading-tight">{user?.firstName}</h2>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-10 leading-tight">{user?.lastName}</h2>

                        <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-5 rounded-3xl bg-[#0f1117] text-gray-500 hover:bg-red-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.2em] border border-gray-800">
                            <LogOut size={16} /> Вийти з системи
                        </button>
                    </div>
                </div>

                {/* ПРАВА ПАНЕЛЬ */}
                <div className="lg:col-span-2">
                    <div className="bg-[#1a1d26] p-10 md:p-14 rounded-[2.5rem] border border-gray-800 shadow-2xl relative h-full">
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-10 flex items-center gap-4 border-l-4 border-red-600 pl-6">
                            <UserIcon className="text-red-600" size={28} /> Особисті дані
                        </h3>

                        <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-8">
                            <div className="space-y-6 text-left">
                                <div className="flex flex-col gap-2 border-b border-gray-800/50 pb-4">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Ім'я</label>
                                    {isEditing ? (
                                        <input {...register('firstName', { required: true })} className="w-full p-3 bg-[#0f1117] border border-gray-700 rounded-xl outline-none focus:border-red-600 transition-all font-bold text-white" />
                                    ) : (
                                        <span className="text-xl font-bold ml-1">{user?.firstName}</span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 border-b border-gray-800/50 pb-4">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Прізвище</label>
                                    {isEditing ? (
                                        <input {...register('lastName', { required: true })} className="w-full p-3 bg-[#0f1117] border border-gray-700 rounded-xl outline-none focus:border-red-600 transition-all font-bold text-white" />
                                    ) : (
                                        <span className="text-xl font-bold ml-1">{user?.lastName}</span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 border-b border-gray-800/50 pb-4">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Дата народження</label>
                                    {isEditing ? (
                                        <input type="date" {...register('birthDate', { required: true })} className="w-full p-3 bg-[#0f1117] border border-gray-700 rounded-xl outline-none focus:border-red-600 transition-all font-bold text-white" />
                                    ) : (
                                        <div className="flex items-center gap-2 ml-1 font-bold text-xl">
                                            <Calendar size={18} className="text-red-600" />
                                            <span>{user?.birthDate ? new Date(user.birthDate).toLocaleDateString() : '—'}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 border-b border-gray-800/50 pb-4">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Email</label>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold ml-1">{user?.email}</span>
                                        {isEditing && (
                                            <button type="button" onClick={() => setIsEmailModalOpen(true)} className="flex items-center gap-2 text-[10px] font-black uppercase bg-red-600/10 text-red-500 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                                                <AtSign size={14} /> змінити
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 border-b border-gray-800/50 pb-4">
                                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Пароль</label>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold ml-1 tracking-[0.3em] text-gray-700">••••••••</span>
                                        {isEditing && (
                                            <button type="button" onClick={() => setIsPassModalOpen(true)} className="flex items-center gap-2 text-[10px] font-black uppercase bg-red-600/10 text-red-500 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                                                <KeyRound size={14} /> змінити
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 flex gap-4">
                                {!isEditing ? (
                                    <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-10 py-5 bg-red-600 hover:bg-red-700 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-red-600/20">
                                        <Pencil size={16} /> Редагувати
                                    </button>
                                ) : (
                                    <>
                                        <Button type="submit" disabled={!isDirty} className={`px-10 py-5 uppercase text-[11px] font-black tracking-widest ${!isDirty ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <Check size={18} className="mr-2" /> Зберегти зміни
                                        </Button>
                                        <button type="button" onClick={() => { setIsEditing(false); reset(); }} className="px-10 py-5 bg-gray-800 hover:bg-gray-700 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all">
                                            Скасувати
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* ПОПАП АВАТАРА */}
            {isAvatarModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setIsAvatarModalOpen(false)}></div>
                    <div className="bg-[#1a1d26] w-full max-w-sm p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl relative z-10 animate-in zoom-in-95">
                        <button onClick={() => setIsAvatarModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
                        <div className="text-center mb-8">
                            <h4 className="text-xl font-black uppercase tracking-tighter text-white">Фото профілю</h4>
                        </div>
                        <div className="space-y-3">
                            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-3 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-red-600/20">
                                <Upload size={18} /> Завантажити
                            </button>
                            {user?.avatarUri && (
                                <button onClick={() => setIsDeleteConfirmOpen(true)} className="w-full flex items-center justify-center gap-3 py-4 bg-gray-800 hover:bg-red-600/20 hover:text-red-500 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-gray-700">
                                    <Trash2 size={18} /> Видалити
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onAvatarChange} />
                        </div>
                    </div>
                </div>
            )}

            {/* ПОПАП ПІДТВЕРДЖЕННЯ ВИДАЛЕННЯ */}
            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsDeleteConfirmOpen(false)}></div>
                    <div className="bg-[#1a1d26] w-full max-w-sm p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 text-center">
                        <div className="bg-red-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Trash2 className="text-red-600" size={32} />
                        </div>
                        <h4 className="text-xl font-black uppercase tracking-tighter text-white mb-2">Видалити фото?</h4>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-8 leading-tight">Цю дію неможливо буде скасувати</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={handleDeleteAvatar} disabled={isActionLoading} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-red-600/20">
                                {isActionLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Так, видалити"}
                            </button>
                            <button onClick={() => setIsDeleteConfirmOpen(false)} className="w-full py-4 bg-gray-800 text-gray-400 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Скасувати</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ПОПАПИ ПАРОЛЯ ТА ПОШТИ */}
            {isPassModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setIsPassModalOpen(false)}></div>
                    <div className="bg-[#1a1d26] w-full max-w-md p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl relative z-10 animate-in zoom-in-95 text-white">
                        <button onClick={() => setIsPassModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
                        <div className="mb-8 text-center text-white">
                            <div className="bg-red-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"><KeyRound className="text-red-600" size={32} /></div>
                            <h4 className="text-2xl font-black uppercase tracking-tighter">Зміна пароля</h4>
                        </div>
                        <form onSubmit={handlePassSubmit(onChangePassword)} className="space-y-4 text-left">
                            <input type="password" {...regPass('oldPassword', { required: true })} placeholder="Старий пароль" className="w-full p-4 bg-[#0f1117] border border-gray-800 rounded-2xl outline-none focus:border-red-600 text-white font-bold" />
                            <input type="password" {...regPass('newPassword', { required: true, minLength: 6 })} placeholder="Новий пароль" className="w-full p-4 bg-[#0f1117] border border-gray-800 rounded-2xl outline-none focus:border-red-600 text-white font-bold" />
                            <Button type="submit" isLoading={isActionLoading} className="w-full py-5 uppercase text-[10px] font-black tracking-widest mt-4">Оновити пароль</Button>
                        </form>
                    </div>
                </div>
            )}

            {isEmailModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setIsEmailModalOpen(false)}></div>
                    <div className="bg-[#1a1d26] w-full max-w-md p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl relative z-10 animate-in zoom-in-95 text-white">
                        <button onClick={() => setIsEmailModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
                        <div className="mb-8 text-center text-white">
                            <div className="bg-red-600/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 font-sans"><AtSign className="text-red-600" size={32} /></div>
                            <h4 className="text-2xl font-black uppercase tracking-tighter font-sans text-white">Новий Email</h4>
                        </div>
                        <form onSubmit={handleEmailSubmit(onChangeEmail)} className="space-y-4 text-left">
                            <input type="email" {...regEmail('newEmail', { required: true })} className="w-full p-4 bg-[#0f1117] border border-gray-800 rounded-2xl outline-none focus:border-red-600 text-white font-bold" />
                            <input type="password" {...regEmail('currentPassword', { required: true })} className="w-full p-4 bg-[#0f1117] border border-gray-800 rounded-2xl outline-none focus:border-red-600 text-white font-bold" />
                            <Button type="submit" isLoading={isActionLoading} className="w-full py-5 uppercase text-[10px] font-black tracking-widest mt-4">Підтвердити зміну</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};