import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Check, Loader2, Plus } from 'lucide-react';

interface Item {
    id: number;
    name?: string;
    firstName?: string;
    lastName?: string;
}

interface AsyncProps<T> {
    title: string;
    icon?: React.ReactNode;
    fetchData: (params: { Page: number; PageSize: number; search?: string }) => Promise<{ items: T[], totalCount: number }>;
    renderLabel: (item: T) => string;
    color: 'amber' | 'purple' | 'blue';
    itemsPerPage?: number;
    searchPlaceholder?: string;
    onAdd?: () => void;
    refreshTrigger?: number;
}

interface MultiProps<T> extends AsyncProps<T> {
    selectedIds: number[];
    onToggle: (id: number) => void;
    withRoleInput?: boolean;
    getRoleValue?: (id: number) => string;
    onRoleChange?: (id: number, value: string) => void;
}

interface SingleProps<T> extends AsyncProps<T> {
    selectedId?: number;
    onSelect: (id: number) => void;
}

const colorClasses = {
    amber: {
        addButton: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20',
        selectedCard: 'bg-amber-600 border-amber-500 shadow-lg shadow-amber-600/10',
        titleText: 'text-amber-500',
        inputFocus: 'focus:border-amber-500',
        checkboxSelected: 'bg-white border-white text-black',
        checkboxUnselected: 'border-gray-600 bg-transparent group-hover:border-gray-500',
        roleInput: 'bg-black/20 text-white placeholder-white/70 focus:bg-black/40 border-transparent focus:border-white/30'
    },
    purple: {
        addButton: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20',
        selectedCard: 'bg-purple-600 border-purple-500 shadow-lg shadow-purple-600/10',
        titleText: 'text-purple-500',
        inputFocus: 'focus:border-purple-500',
        checkboxSelected: 'bg-white border-white text-black',
        checkboxUnselected: 'border-gray-600 bg-transparent group-hover:border-gray-500',
        roleInput: 'bg-black/20 text-white placeholder-white/70 focus:bg-black/40 border-transparent focus:border-white/30'
    },
    blue: {
        addButton: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
        selectedCard: 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/10',
        titleText: 'text-blue-500',
        inputFocus: 'focus:border-blue-500',
        checkboxSelected: 'bg-white border-white text-black',
        checkboxUnselected: 'border-gray-600 bg-transparent group-hover:border-gray-500',
        roleInput: 'bg-black/20 text-white placeholder-white/70 focus:bg-black/40 border-transparent focus:border-white/30'
    }
};

const MiniPagination = ({ current, total, onPrev, onNext }: { current: number, total: number, onPrev: () => void, onNext: () => void }) => {
    if (total <= 1) return null;
    return (
        <div className="flex items-center gap-2 pt-4 pl-1">
            <button type="button" onClick={onPrev} disabled={current === 1} className="p-1.5 bg-gray-900 rounded-lg disabled:opacity-20 hover:bg-gray-800 transition-colors text-gray-400 hover:text-white">
                <ChevronLeft size={14}/>
            </button>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Стор. {current}</span>
            <button type="button" onClick={onNext} disabled={current === total} className="p-1.5 bg-gray-900 rounded-lg disabled:opacity-20 hover:bg-gray-800 transition-colors text-gray-400 hover:text-white">
                <ChevronRight size={14}/>
            </button>
        </div>
    );
};

function useLocalAsyncPagination<T>(
    fetchData: AsyncProps<T>['fetchData'],
    pageSize: number,
    refreshTrigger: number = 0
) {
    const [items, setItems] = useState<T[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetchData({
                    Page: currentPage,
                    PageSize: pageSize,
                    search: debouncedSearch || undefined
                });
                if (mounted) {
                    setItems(res.items);
                    setTotalCount(res.totalCount);
                }
            } catch (error) {
                console.error("Grid fetch error:", error);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [currentPage, debouncedSearch, pageSize, refreshTrigger]);

    return { items, totalCount, currentPage, totalPages: Math.ceil(totalCount / pageSize), loading, goToPage: setCurrentPage, searchTerm, setSearchTerm };
}

export function AsyncMultiSelectGrid<T extends Item>(props: MultiProps<T>) {
    const { items, totalCount, currentPage, totalPages, loading, goToPage, searchTerm, setSearchTerm } =
        useLocalAsyncPagination(props.fetchData, props.itemsPerPage || 6, props.refreshTrigger);

    const theme = colorClasses[props.color];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end gap-4">
                <div className="flex-1">
                    <h3 className={`${theme.titleText} font-black uppercase text-xs flex items-center gap-2 mb-4 tracking-widest leading-none`}>
                        {props.icon} {props.title}
                    </h3>
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder={props.searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full bg-gray-900 border border-gray-800 hover:border-gray-700 pl-12 pr-4 py-4 rounded-2xl text-xs outline-none ${theme.inputFocus} text-white font-bold shadow-inner transition-colors placeholder-gray-600`}
                        />
                        {loading && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-500" />}
                    </div>
                </div>
                {props.onAdd && (
                    <button onClick={(e) => { e.preventDefault(); props.onAdd?.(); }} className={`p-4 rounded-2xl ${theme.addButton} transition-all active:scale-95`}>
                        <Plus size={20} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 min-h-[100px]">
                {items.map(item => {
                    const isSelected = props.selectedIds.some(id => Number(id) === Number(item.id));
                    return (
                        <div
                            key={item.id}
                            className={`flex flex-col justify-center p-4 rounded-3xl border transition-all cursor-pointer group select-none relative overflow-hidden ${
                                isSelected ? theme.selectedCard : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                            }`}
                            onClick={() => props.onToggle(item.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all shrink-0 ${
                                    isSelected ? theme.checkboxSelected : theme.checkboxUnselected
                                }`}>
                                    {isSelected && <Check size={12} strokeWidth={4} />}
                                </div>
                                <span className={`text-[11px] font-black uppercase tracking-tight transition-colors truncate ${
                                    isSelected ? 'text-white' : 'text-gray-500 group-hover:text-white'
                                }`}>
                                    {props.renderLabel(item)}
                                </span>
                            </div>

                            {/* --- ІНПУТ ДЛЯ РОЛІ (З'являється тільки якщо вибрано і увімкнено) --- */}
                            {isSelected && props.withRoleInput && (
                                <div className="mt-3 animate-in slide-in-from-top-2 fade-in duration-200">
                                    <input
                                        type="text"
                                        placeholder="Вкажіть роль..."
                                        className={`w-full text-[10px] font-bold py-2 px-3 rounded-xl outline-none border transition-all ${theme.roleInput}`}
                                        value={props.getRoleValue ? props.getRoleValue(item.id) : ''}
                                        onClick={(e) => e.stopPropagation()} // Зупиняємо клік, щоб не знімати вибір
                                        onChange={(e) => props.onRoleChange?.(item.id, e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
                {!loading && items.length === 0 && (
                    <div className="col-span-full text-center py-6 text-gray-600 text-xs font-bold uppercase tracking-widest opacity-50">Нічого не знайдено</div>
                )}
            </div>

            {totalCount > 0 && (
                <MiniPagination current={currentPage} total={totalPages} onPrev={() => goToPage(currentPage - 1)} onNext={() => goToPage(currentPage + 1)} />
            )}
        </div>
    );
}

export function AsyncSingleSelectGrid<T extends Item>(props: SingleProps<T>) {
    const { items, totalCount, currentPage, totalPages, loading, goToPage, searchTerm, setSearchTerm } =
        useLocalAsyncPagination(props.fetchData, props.itemsPerPage || 6, props.refreshTrigger);

    const theme = colorClasses[props.color];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end gap-4">
                <div className="flex-1">
                    <h3 className={`${theme.titleText} font-black uppercase text-xs flex items-center gap-2 mb-4 tracking-widest leading-none`}>
                        {props.icon} {props.title}
                    </h3>
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder={props.searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full bg-gray-900 border border-gray-800 hover:border-gray-700 pl-12 pr-4 py-4 rounded-2xl text-xs outline-none ${theme.inputFocus} text-white font-bold shadow-inner transition-colors placeholder-gray-600`}
                        />
                        {loading && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-gray-500" />}
                    </div>
                </div>
                {props.onAdd && (
                    <button onClick={(e) => { e.preventDefault(); props.onAdd?.(); }} className={`p-4 rounded-2xl ${theme.addButton} transition-all active:scale-95`}>
                        <Plus size={20} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 min-h-[100px]">
                {items.map(item => {
                    const isSelected = props.selectedId === item.id;
                    return (
                        <div
                            key={item.id}
                            className={`flex items-center justify-center p-5 rounded-3xl border transition-all cursor-pointer group select-none text-center ${
                                isSelected ? theme.selectedCard : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                            }`}
                            onClick={() => props.onSelect(item.id)}
                        >
                            <span className={`text-[11px] font-black uppercase tracking-tight transition-colors truncate ${
                                isSelected ? 'text-white' : 'text-gray-500 group-hover:text-white'
                            }`}>
                                {props.renderLabel(item)}
                            </span>
                        </div>
                    );
                })}
                {!loading && items.length === 0 && (
                    <div className="col-span-full text-center py-6 text-gray-600 text-xs font-bold uppercase tracking-widest opacity-50">Нічого не знайдено</div>
                )}
            </div>

            {totalCount > 0 && (
                <MiniPagination current={currentPage} total={totalPages} onPrev={() => goToPage(currentPage - 1)} onNext={() => goToPage(currentPage + 1)} />
            )}
        </div>
    );
}