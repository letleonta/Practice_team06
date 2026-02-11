import { useEffect, useState } from 'react';
import type { SessionDto } from '../../types/session';
import { SessionItem } from '../SessionComponents/SessionItem';
import { Calendar, Loader2, Filter, X, Trash2, CheckSquare, Square } from 'lucide-react';
import { Pagination } from '../ui/Pagination.tsx';
import { PaginationInfo } from '../ui/PaginationInfo.tsx';

interface Props {
    sessions: SessionDto[];
    loading: boolean;

    selectedIds: number[];
    onToggleSelect: (id: number) => void;
    onToggleSelectAll: () => void;
    onDeleteClick: () => void;
    onEdit: (session: SessionDto) => void;

    totalCount: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onFilterChange: (startDate: string, endDate: string, weekdays: number[]) => void;
}

const WEEKDAYS = [
    { id: 1, label: 'Пн' }, { id: 2, label: 'Вт' }, { id: 3, label: 'Ср' },
    { id: 4, label: 'Чт' }, { id: 5, label: 'Пт' }, { id: 6, label: 'Сб' }, { id: 0, label: 'Нд' }
];

export const SessionList = ({
                                sessions, loading,
                                selectedIds, onToggleSelect, onToggleSelectAll, onDeleteClick, onEdit,
                                totalCount, currentPage, totalPages, pageSize, onPageChange, onFilterChange
                            }: Props) => {

    const [uiMode, setUiMode] = useState<'range' | 'weekday'>('range');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);

    useEffect(() => {
        onFilterChange(dateFrom, dateTo, selectedWeekdays);
    }, [dateFrom, dateTo, selectedWeekdays]);

    const clearFilters = () => {
        setDateFrom('');
        setDateTo('');
        setSelectedWeekdays([]);
    };

    const toggleWeekday = (id: number) => {
        setSelectedWeekdays(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const isAllPageSelected = sessions.length > 0 && sessions.every(s => selectedIds.includes(s.id));

    return (
        <div className="bg-[#1a1d26] flex-1 rounded-4xl border border-gray-800 shadow-xl overflow-hidden flex flex-col min-h-[500px]">
            <div className="p-6 border-b border-gray-800 bg-gray-900/30 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div className="flex items-center gap-4 w-full xl:w-auto">
                    {selectedIds.length > 0 ? (
                        <button
                            onClick={onDeleteClick}
                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 animate-fade-in shadow-lg shadow-red-900/20"
                        >
                            <Trash2 size={16} /> Видалити обрані ({selectedIds.length})
                        </button>
                    ) : (
                        <h3 className="font-bold flex items-center gap-2 text-white text-lg">
                            Активні сеанси
                            <span className={`px-2 py-0.5 rounded text-xs ${totalCount > 0 ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                {totalCount}
                            </span>
                        </h3>
                    )}

                    {sessions.length > 0 && (
                        <button
                            onClick={onToggleSelectAll}
                            className="ml-auto xl:ml-2 text-gray-500 hover:text-white transition-colors"
                            title="Вибрати всі на сторінці"
                        >
                            {isAllPageSelected
                                ? <CheckSquare size={20} className="text-emerald-500"/>
                                : <Square size={20} />}
                        </button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full xl:w-auto">
                    <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-700">
                        <button
                            onClick={() => setUiMode('range')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${uiMode === 'range' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Період
                        </button>
                        <button
                            onClick={() => setUiMode('weekday')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex gap-1 ${uiMode === 'weekday' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Дні тижня
                            {selectedWeekdays.length > 0 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5"></span>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-900/50 p-1 rounded-xl border border-gray-700 min-h-[42px]">
                        <Filter size={14} className="text-gray-500 ml-2" />

                        {uiMode === 'weekday' ? (
                            <div className="flex gap-1 px-2">
                                {WEEKDAYS.map(day => (
                                    <button
                                        key={day.id}
                                        onClick={() => toggleWeekday(day.id)}
                                        className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all ${
                                            selectedWeekdays.includes(day.id)
                                                ? 'bg-emerald-500 text-white shadow-lg'
                                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        }`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="bg-transparent text-white text-xs outline-none p-2 w-28 [color-scheme:dark] cursor-pointer font-bold uppercase"
                                    placeholder="Від"
                                />
                                <span className="text-gray-600 font-bold">-</span>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="bg-transparent text-white text-xs outline-none p-2 w-28 [color-scheme:dark] cursor-pointer font-bold uppercase"
                                    placeholder="До"
                                />
                            </>
                        )}

                        {(dateFrom || dateTo || selectedWeekdays.length > 0) && (
                            <button onClick={clearFilters} className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="overflow-y-auto flex-1 p-4 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <Loader2 className="animate-spin mb-2 text-red-600" size={24} />
                        <p className="text-xs">Завантаження розкладу...</p>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10 opacity-50">
                        <Calendar size={40} className="mb-2" />
                        <p className="text-sm">
                            {(dateFrom || selectedWeekdays.length > 0)
                                ? "Сеансів за цим фільтром не знайдено"
                                : "Немає запланованих сеансів"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {sessions.map(session => {
                            const isSelected = selectedIds.includes(session.id);
                            return (
                                <div
                                    key={session.id}
                                    className={`relative group rounded-2xl transition-all duration-200 ${isSelected ? 'ring-2 ring-emerald-500 bg-emerald-900/10' : ''}`}
                                    onClick={(e) => {
                                        if (!(e.target as HTMLElement).closest('button')) {
                                            onToggleSelect(session.id);
                                        }
                                    }}
                                >
                                    <div className={`absolute top-3 left-3 z-20 cursor-pointer transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'bg-black/50 border-white/30 hover:border-white'}`}>
                                            {isSelected && <Trash2 size={12} className="text-white" />}
                                        </div>
                                    </div>

                                    <div className={isSelected ? 'opacity-80' : ''}>
                                        <SessionItem
                                            session={session}
                                            onDelete={(id) => {
                                                onToggleSelect(id);
                                                onDeleteClick();
                                            }}
                                            onEdit={onEdit}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-800 bg-gray-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <PaginationInfo
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalCount={totalCount}
                        itemName="сеансів"
                    />

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
};