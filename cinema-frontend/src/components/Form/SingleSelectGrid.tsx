import { Search } from 'lucide-react';
import { useState } from 'react';
import { MiniPagination } from "./MultipleSelectGrid.tsx";
import { IconButton } from "../ui/IconButton";

interface BaseItem {
    id: number;
}

interface SingleSelectGridProps<T extends BaseItem> {
    title: string;
    items: T[];
    selectedId: number | undefined;
    onSelect: (id: number) => void;
    onAdd: () => void;
    renderLabel: (item: T) => string;
    searchPlaceholder?: string;
    accentColor?: 'amber' | 'purple' | 'red' | 'blue'; // Обмежив типи для безпеки
    itemsPerPage?: number;
}

export function SingleSelectGrid<T extends BaseItem>({
                                                         title,
                                                         items,
                                                         selectedId,
                                                         onSelect,
                                                         onAdd,
                                                         renderLabel,
                                                         searchPlaceholder = "Пошук...",
                                                         accentColor = "amber",
                                                         itemsPerPage = 6
                                                     }: SingleSelectGridProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter & Paginate логіка
    const filtered = items.filter(item =>
        renderLabel(item).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const activeVariants: Record<string, string> = {
        amber: 'bg-amber-600 border-amber-500 shadow-amber-600/20',
        purple: 'bg-purple-600 border-purple-500 shadow-purple-600/20',
        red: 'bg-red-600 border-red-500 shadow-red-600/20',
        blue: 'bg-blue-500 border-blue-400 shadow-blue-500/20',
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end gap-4">
                <div className="flex-1">
                    <label className="text-[10px] text-gray-500 font-black uppercase mb-3 block tracking-widest leading-none">
                        {title}
                    </label>
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className={`w-full bg-gray-900 border border-gray-700 pl-12 pr-4 py-4 rounded-2xl text-xs outline-none transition-all text-white font-bold shadow-inner focus:border-${accentColor}-500`}
                        />
                    </div>
                </div>

                <IconButton
                    onClick={onAdd}
                    color={accentColor}
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {paginated.map(item => {
                    const isSelected = selectedId === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelect(item.id)}
                            className={`p-5 rounded-3xl border text-[11px] font-black uppercase transition-all ${
                                isSelected
                                    ? `${activeVariants[accentColor]} text-white shadow-xl`
                                    : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600'
                            }`}
                        >
                            {renderLabel(item)}
                        </button>
                    );
                })}
            </div>

            {totalPages > 1 && (
                <MiniPagination
                    current={currentPage}
                    total={totalPages}
                    onPrev={() => setCurrentPage(p => Math.max(1, p - 1))}
                    onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                />
            )}
        </div>
    );
}