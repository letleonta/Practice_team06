export type FilterStatus = 'ALL' | 'ACTIVE' | 'PAST' | 'CANCELLED';

interface BookingFilterBarProps {
    activeFilter: FilterStatus;
    onFilterChange: (filter: FilterStatus) => void;
}

const FILTERS: { key: FilterStatus; label: string; count?: number }[] = [
    { key: 'ALL', label: 'Усі' },
    { key: 'ACTIVE', label: 'Активні' },
    { key: 'PAST', label: 'Завершені' },
    { key: 'CANCELLED', label: 'Скасовані' },
];

const BookingFilterBar = ({ activeFilter, onFilterChange }: BookingFilterBarProps) => {
    return (
        <div className="flex flex-wrap gap-2 mb-8">
            {FILTERS.map((filter) => {
                const isActive = activeFilter === filter.key;
                return (
                    <button
                        key={filter.key}
                        onClick={() => onFilterChange(filter.key)}
                        className={`
                            px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200
                            ${isActive
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/25 scale-105'
                            : 'bg-[#1a1d26] text-gray-400 border border-gray-700 hover:border-red-600/50 hover:text-white'
                        }
                        `}
                    >
                        {filter.label}
                    </button>
                );
            })}
        </div>
    );
};

export default BookingFilterBar;