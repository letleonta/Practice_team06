import {Search, ChevronLeft, ChevronRight, Check} from 'lucide-react';
import React, { useState } from 'react';
import {IconButton} from "../ui/IconButton.tsx";

interface Item {
    id: number;
    name?: string;
    firstName?: string;
    lastName?: string;
}

export const MiniPagination = ({ current, total, onPrev, onNext }: { current: number, total: number, onPrev: () => void, onNext: () => void }) => {
    if (total <= 1) return null;
    return (
        <div className="flex items-center gap-2 pt-4">
            <button type="button" onClick={onPrev} disabled={current === 1} className="p-1.5 bg-gray-900 rounded-lg disabled:opacity-20 hover:bg-gray-800 transition-colors"><ChevronLeft size={14}/></button>
            <span className="text-[10px] text-gray-500 font-bold uppercase">Стор. {current}</span>
            <button type="button" onClick={onNext} disabled={current === total} className="p-1.5 bg-gray-900 rounded-lg disabled:opacity-20 hover:bg-gray-800 transition-colors"><ChevronRight size={14}/></button>
        </div>
    );
};

interface MultipleSelector<T extends Item> {
    title?: string;
    icon?: React.ReactNode;
    items: T[];
    selectedIds: number[];
    onToggle: (id: number) => void;
    onAdd: () => void;
    renderLabel: (item: T) => string;
    color: 'amber' | 'purple';
    itemsPerPage?: number;
    searchPlaceholder?: string;
}

export function MultipleSelectGrid<T extends Item>({
                                                   title,
                                                   icon,
                                                   items,
                                                   selectedIds,
                                                   onToggle,
                                                   onAdd,
                                                   renderLabel,
                                                   color,
                                                   itemsPerPage = 6,
                                                   searchPlaceholder = 'Пошук...'
                                               }: MultipleSelector<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter items
    const filtered = items.filter(item => {
        const label = renderLabel(item).toLowerCase();
        return label.includes(searchTerm.toLowerCase());
    });

    // Paginate
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page when search changes
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    // Color variants
    const colorClasses = {
        amber: {
            button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/10',
            selected: 'bg-amber-600 border-amber-500 shadow-lg shadow-amber-600/10',
            accent: 'accent-amber-600',
            focus: 'focus:border-amber-500',
            text: 'text-amber-500'
        },
        purple: {
            button: 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/10',
            selected: 'bg-purple-600 border-purple-500 shadow-lg shadow-purple-600/10',
            accent: 'accent-purple-600',
            focus: 'focus:border-purple-500',
            text: 'text-purple-500'
        }
    };

    const colors = colorClasses[color];

    return (
        <div className="space-y-6">
            {/* Header with search and add button */}
            <div className="flex justify-between items-end gap-4">
                <div className="flex-1">
                    <h3 className={`${colors.text} font-black uppercase text-xs flex items-center gap-3 mb-4 tracking-widest leading-none`}>
                        {icon} {title}
                    </h3>
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className={`w-full bg-gray-900 border border-gray-700 pl-12 pr-4 py-4 rounded-2xl text-xs outline-none ${colors.focus} text-white font-bold shadow-inner`}
                        />
                    </div>
                </div>
                <IconButton
                    onClick={onAdd}
                    color={color}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {paginated.map(item => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                        <div
                            key={item.id}
                            className={`flex items-center gap-4 p-5 rounded-3xl border transition-all cursor-pointer group select-none ${
                                isSelected
                                    ? colors.selected
                                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                            }`}
                            onClick={() => onToggle(item.id)}
                        >
                            <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                                isSelected
                                    ? 'bg-white border-white'
                                    : 'border-gray-700 bg-gray-950 group-hover:border-gray-500'
                            }`}>
                                {isSelected && <Check size={12} className="text-black stroke-[4]" />}
                            </div>

                            <span
                                className={`text-[11px] font-black uppercase tracking-tight transition-colors ${
                                    isSelected
                                        ? 'text-white'
                                        : 'text-gray-500 group-hover:text-white'
                                }`}
                            >
                    {renderLabel(item)}
                </span>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
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