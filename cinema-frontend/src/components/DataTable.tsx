import type {ReactNode} from 'react';
import { Loader2, ArrowUpDown, TrendingDown, TrendingUp } from 'lucide-react';

// Types
export interface Column<T> {
    key: string;
    header: string | ReactNode;
    sortable?: boolean;
    sortKey?: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render: (item: T) => ReactNode;
}

export interface SortConfig {
    sortBy: string | null;
    isDesc: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    error?: string | null;
    emptyMessage?: string;
    emptyIcon?: ReactNode;
    onRowClick?: (item: T) => void;
    sortConfig?: SortConfig;
    onSort?: (sortKey: string) => void;
    getRowKey?: (item: T) => string | number;
    className?: string;
}

// SortIcon Component
interface SortIconProps {
    sortKey: string;
    currentSort: string | null;
    isDesc: boolean;
}

const SortIcon = ({ sortKey, currentSort, isDesc }: SortIconProps) => {
    if (currentSort !== sortKey) {
        return <ArrowUpDown size={14} className="text-gray-600" />;
    }
    return isDesc
        ? <TrendingDown size={14} className="text-red-500" />
        : <TrendingUp size={14} className="text-red-500" />;
};

// Main Component
export function DataTable<T>({
                                 data,
                                 columns,
                                 loading = false,
                                 error = null,
                                 emptyMessage = 'Немає даних',
                                 emptyIcon,
                                 onRowClick,
                                 sortConfig,
                                 onSort,
                                 getRowKey = (item: any) => item.id,
                                 className = ''
                             }: DataTableProps<T>) {
    const colSpan = columns.length;

    const handleSort = (sortKey?: string) => {
        if (sortKey && onSort) {
            onSort(sortKey);
        }
    };

    return (
        <div className={`bg-[#1a1d26] border border-gray-800 rounded-2xl overflow-hidden shadow-xl ${className}`}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    {/* Header */}
                    <thead>
                    <tr className="border-b border-gray-800 bg-[#161820]">
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={`px-4 py-3 text-gray-500 font-semibold uppercase text-xs tracking-wider ${
                                    column.align === 'right' ? 'text-right' :
                                        column.align === 'center' ? 'text-center' :
                                            'text-left'
                                } ${column.width || ''}`}
                            >
                                {column.sortable && column.sortKey ? (
                                    <button
                                        onClick={() => handleSort(column.sortKey)}
                                        className="flex items-center gap-1.5 hover:text-white transition-colors"
                                    >
                                        {column.header}
                                        {sortConfig && (
                                            <SortIcon
                                                sortKey={column.sortKey}
                                                currentSort={sortConfig.sortBy}
                                                isDesc={sortConfig.isDesc}
                                            />
                                        )}
                                    </button>
                                ) : (
                                    column.header
                                )}
                            </th>
                        ))}
                    </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={colSpan} className="py-16 text-center">
                                <Loader2 size={32} className="animate-spin text-red-600 mx-auto mb-3" />
                                <p className="text-gray-500">Завантаження…</p>
                            </td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan={colSpan} className="py-16 text-center">
                                <p className="text-red-500 text-xl mb-4">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                                >
                                    Спробувати знову
                                </button>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={colSpan} className="py-16 text-center">
                                {emptyIcon && <div className="mb-3">{emptyIcon}</div>}
                                <p className="text-gray-500">{emptyMessage}</p>
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr
                                key={getRowKey(item)}
                                onClick={() => onRowClick?.(item)}
                                className={`border-b border-gray-800/60 hover:bg-[#22252f] transition-colors ${
                                    onRowClick ? 'cursor-pointer group' : ''
                                }`}
                            >
                                {columns.map((column, index) => (
                                    <td
                                        key={index}
                                        className={`px-4 py-3 ${
                                            column.align === 'right' ? 'text-right' :
                                                column.align === 'center' ? 'text-center' :
                                                    'text-left'
                                        }`}
                                    >
                                        {column.render(item)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}