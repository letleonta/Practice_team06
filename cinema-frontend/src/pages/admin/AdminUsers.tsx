import { useEffect, useState, useMemo } from 'react';
import { userService } from '../../services/user.service.ts';
import { useAuthStore } from '../../store/useAuthStore';
import {
    Users,
    User as UserIcon,
    Search,
    Loader2,
    ShieldCheck,
    ShieldAlert,
} from 'lucide-react';
import type { UserDto } from '../../types/user';

const AdminUsers = () => {
    const { user: currentUser } = useAuthStore();
    const [users, setUsers] = useState<UserDto[]>([]);
    const [search, setSearch] = useState('');
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [isLoadingPage, setIsLoadingPage] = useState(true);


    const canEdit = currentUser?.role === 'Manager';

    const loadUsers = async () => {
        try {
            setIsLoadingPage(true);
            const data = await userService.getAll();
            setUsers(data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setIsLoadingPage(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const getUserRole = (u: UserDto): 'Admin' | 'Customer' | 'Manager' => {
        if (u.roles.includes('Admin')) return 'Admin';
        if (u.roles.includes('Manager')) return 'Manager';
        return 'Customer';
    };

    const handleRoleChange = async (email: string, newRole: 'Admin' | 'Customer') => {
        if (!canEdit) return;
        setLoadingId(email);
        try {
            await userService.assignRole(email, newRole);
            await loadUsers();
        } catch (err: any) {
            alert("Помилка зміни ролі");
        } finally {
            setLoadingId(null);
        }
    };

    // --- ФІЛЬТРАЦІЯ: Приховуємо Менеджерів зі списку ---
    const filteredUsers = useMemo(() => {
        return users
            .filter((u: UserDto) =>
                u.email.toLowerCase().includes(search.toLowerCase()) &&
                !u.roles.includes('Manager') // <--- ЦЕЙ РЯДОК ПРИХОВУЄ МЕНЕДЖЕРА
            )
            .sort((a, b) => a.id - b.id);
    }, [users, search]);

    return (
        <div className="max-w-6xl mx-auto text-white animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-600 p-2 rounded-xl shadow-lg">
                            <Users size={32} className="text-white" />
                        </div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Керування правами</h2>
                    </div>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1 text-red-500">
                        Лише Менеджер може призначати Адміністраторів
                    </p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input
                        type="text"
                        placeholder="Пошук користувача..."
                        className="w-full bg-[#1a1d26] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-red-600 transition-all text-sm shadow-inner"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-[#1a1d26] rounded-[40px] border border-gray-800 overflow-hidden shadow-2xl relative">
                {isLoadingPage ? (
                    <div className="py-32 flex flex-col items-center justify-center gap-4 text-gray-600">
                        <Loader2 className="animate-spin text-red-600" size={48} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Оновлення бази...</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-gray-900/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                            <th className="p-6">Обліковий запис</th>
                            <th className="p-6">Поточна роль</th>
                            <th className="p-6 text-right">Змінити доступ</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                        {filteredUsers.map((u: UserDto) => {
                            const role = getUserRole(u);
                            const isAdmin = role === 'Admin';

                            return (
                                <tr key={u.id} className="group hover:bg-white/[0.01] transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                                                isAdmin ? 'bg-red-600/10 border-red-500/20 text-red-500' : 'bg-gray-800 border-gray-700 text-gray-500'
                                            }`}>
                                                <UserIcon size={24} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-gray-100 truncate">{u.email}</span>
                                                <span className="text-[10px] text-gray-600 font-mono uppercase italic tracking-tighter">
                                                        {u.firstName} {u.lastName}
                                                    </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${
                                            isAdmin
                                                ? 'bg-red-600 text-white border-red-400'
                                                : 'bg-blue-600/10 text-blue-500 border-blue-500/20'
                                        }`}>
                                            {isAdmin ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                            {role}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end">
                                            {loadingId === u.email ? (
                                                <div className="flex items-center gap-2 text-red-600 text-[10px] font-black uppercase animate-pulse mr-4">
                                                    <Loader2 className="animate-spin" size={14} /> Оновлення...
                                                </div>
                                            ) : canEdit ? (
                                                // ЯКЩО ЗАЙШОВ МЕНЕДЖЕР - ПОКАЗУЄМО КНОПКИ
                                                <div className="flex bg-[#0f1117] p-1 rounded-2xl border border-gray-800 shadow-inner overflow-hidden">
                                                    <button
                                                        onClick={() => isAdmin && handleRoleChange(u.email, 'Customer')}
                                                        className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${
                                                            !isAdmin ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-600 hover:text-gray-400'
                                                        }`}
                                                    >CUSTOMER</button>
                                                    <button
                                                        onClick={() => !isAdmin && handleRoleChange(u.email, 'Admin')}
                                                        className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${
                                                            isAdmin ? 'bg-red-600 text-white shadow-xl' : 'text-gray-600 hover:text-gray-400'
                                                        }`}
                                                    >ADMIN</button>
                                                </div>
                                            ) : (
                                                // ЯКЩО ЗАЙШОВ АДМІН - ПОКАЗУЄМО ТЕКСТ "БЕЗ ДОСТУПУ"
                                                <div className="px-4 py-2 rounded-xl bg-gray-800/30 border border-gray-800 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                                    Тільки перегляд
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="mt-10 flex justify-center italic opacity-30 text-[10px] uppercase font-black tracking-[0.4em]">
                System Root Access Required
            </div>
        </div>
    );
};

export default AdminUsers;