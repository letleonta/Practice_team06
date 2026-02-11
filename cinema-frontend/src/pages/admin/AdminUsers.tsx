import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthService } from '../../services/auth.service.ts';
import { UsePagination } from "../../hooks/UsePagination.ts";
import { API_CONFIG } from "../../../config.ts";
import {
    Users, User as UserIcon, Loader2,
    ShieldCheck, ShieldAlert,
} from 'lucide-react';

import type { UserDto } from '../../types/user';
import { DataTable, type Column } from "../../components/ui/DataTable.tsx";
import { SearchInput } from "../../components/ui/SearchInput";
import { Pagination } from "../../components/ui/Pagination.tsx";
import { PaginationInfo } from "../../components/ui/PaginationInfo.tsx";
import { notify } from "../../utils/toast";

type UserSortKey = 'email' | 'firstname' | 'lastname' | 'id';

const AdminUsers = () => {
    const { user: currentUser } = useAuthStore();
    const [search, setSearch] = useState('');
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const [sortConfig, setSortConfig] = useState({
        sortBy: 'id' as UserSortKey,
        isDesc: false
    });

    const canEdit = currentUser?.role === 'Manager';

    const {
        items: users,
        totalCount,
        currentPage,
        totalPages,
        pageSize,
        loading: isLoadingPage,
        error,
        goToPage,
        refresh
    } = UsePagination<UserDto>(
        async (p, ps) => {
            return await AuthService.getAllUsers({
                search: search || undefined,
                sortBy: sortConfig.sortBy === 'id' ? undefined : sortConfig.sortBy,
                isDescending: sortConfig.isDesc,
                Page: p,
                PageSize: ps
            });
        },
        [search, sortConfig.sortBy, sortConfig.isDesc],
        { pageSize: 6 }
    );

    const handleRoleChange = async (email: string, newRole: 'Admin' | 'Customer') => {
        if (!canEdit) return;
        setLoadingId(email);
        try {
            await AuthService.assignRole(email, newRole);
            notify.success(`Роль для ${email} оновлена`);
            await refresh();
        } catch {
            notify.error("Помилка зміни ролі");
        } finally {
            setLoadingId(null);
        }
    };

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            sortBy: key as UserSortKey, // Виправлено: типізація замість any
            isDesc: prev.sortBy === key ? !prev.isDesc : false
        }));
    };

    const getUserRole = (u: UserDto): 'Admin' | 'Customer' | 'Manager' => {
        if (u.roles.includes('Admin')) return 'Admin';
        if (u.roles.includes('Manager')) return 'Manager';
        return 'Customer';
    };

    const columns: Column<UserDto>[] = [
        {
            key: 'email',
            header: 'Електронна пошта',
            sortable: true,
            sortKey: 'email',
            render: (u) => (
                <div className="flex items-center gap-3 py-1 text-left">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                        u.roles.includes('Admin') ? 'bg-red-600/10 border-red-500/20 text-red-500' : 'bg-gray-800 border-gray-700 text-gray-500'
                    }`}>
                        {u.avatarUri ? (
                            <img
                                src={`${API_CONFIG.BASE_URL}${u.avatarUri}`}
                                alt={`Аватар ${u.email}`} // Виправлено: додано alt
                                className="w-full h-full object-cover rounded-lg"
                            />
                        ) : (
                            <UserIcon size={16} />
                        )}
                    </div>
                    {/* Виправлено: max-w-50 замість max-w-[200px] */}
                    <span className="font-bold text-gray-100 truncate max-w-50">{u.email}</span>
                </div>
            )
        },
        {
            key: 'firstName',
            header: "Ім'я",
            sortable: true,
            sortKey: 'firstname',
            render: (u) => <span className="text-gray-400 font-medium uppercase text-[11px] tracking-wider">{u.firstName || '—'}</span>
        },
        {
            key: 'lastName',
            header: "Прізвище",
            sortable: true,
            sortKey: 'lastname',
            render: (u) => <span className="text-gray-400 font-medium uppercase text-[11px] tracking-wider">{u.lastName || '—'}</span>
        },
        {
            key: 'role',
            header: 'Поточна роль',
            align: 'center',
            render: (u) => {
                const role = getUserRole(u);
                const isAdmin = role === 'Admin';
                const isManager = role === 'Manager';
                return (
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${
                        isAdmin ? 'bg-red-600 text-white border-red-400' :
                            isManager ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                'bg-blue-600/10 text-blue-500 border-blue-500/20'
                    }`}>
                        {isAdmin ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                        {role}
                    </div>
                );
            }
        },
        {
            key: 'actions',
            header: 'Змінити доступ',
            align: 'right',
            render: (u) => {
                const isAdmin = u.roles.includes('Admin');
                const isManager = u.roles.includes('Manager');

                if (isManager) return <div className="pr-4 text-[10px] font-black text-amber-500 uppercase tracking-widest">Системний доступ</div>;

                return (
                    <div className="flex items-center justify-end">
                        {loadingId === u.email ? (
                            <div className="flex items-center gap-2 text-red-600 text-[10px] font-black uppercase animate-pulse mr-4">
                                <Loader2 className="animate-spin" size={14} /> Оновлення...
                            </div>
                        ) : canEdit ? (
                            <div className="flex bg-[#0f1117] p-1 rounded-xl border border-gray-800 shadow-inner overflow-hidden">
                                <button
                                    onClick={() => isAdmin && handleRoleChange(u.email, 'Customer')}
                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black transition-all ${!isAdmin ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}
                                >CUSTOMER</button>
                                <button
                                    onClick={() => !isAdmin && handleRoleChange(u.email, 'Admin')}
                                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black transition-all ${isAdmin ? 'bg-red-600 text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}
                                >ADMIN</button>
                            </div>
                        ) : (
                            <div className="px-4 py-2 rounded-xl bg-gray-800/30 border border-gray-800 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                Тільки перегляд
                            </div>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <div className="max-w-6xl mx-auto text-white animate-fade-in pb-10 font-sans">
            {/* Header Area */}
            <div className="flex flex-col gap-2 text-left mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-red-600 p-2 rounded-xl shadow-lg">
                        <Users size={32} className="text-white" />
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Керування правами</h2>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest ml-1 text-red-500">
                    Лише Менеджер може призначати Адміністраторів
                </p>
            </div>

            {/* Search - Full Width */}
            <div className="mb-8">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Пошук за email, ім'ям або прізвищем..."
                    className="w-full"
                />
            </div>

            {/* Table */}
            <DataTable
                data={users}
                columns={columns}
                loading={isLoadingPage}
                error={error}
                sortConfig={sortConfig}
                onSort={handleSort}
                getRowKey={(u) => u.id.toString()}
                emptyMessage="Користувачів не знайдено"
                className="rounded-4xl border-gray-800 shadow-2xl overflow-hidden"
            />

            {/* Pagination Block */}
            {!isLoadingPage && totalPages > 0 && (
                <div className="mt-8 bg-[#161820] p-4 rounded-4xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <PaginationInfo
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalCount={totalCount}
                        itemName="користувачів"
                    />
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                    />
                </div>
            )}

            <div className="mt-10 flex justify-center opacity-20 text-[10px] uppercase font-black tracking-[0.4em]">
                System Root Access Required
            </div>
        </div>
    );
};

export default AdminUsers;