interface PaginationInfoProps {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    itemName?: string;
    className?: string;
}

export const PaginationInfo = ({
                                   currentPage,
                                   pageSize,
                                   totalCount,
                                   itemName = 'результат',
                                   className = ''
                               }: PaginationInfoProps) => {
    if (totalCount === 0) return null;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);

    const getItemNameForm = (count: number) => {
        if (itemName === 'результат') {
            if (count === 1) return 'результат';
            if (count < 5) return 'результати';
            return 'результатів';
        }
        if (itemName === 'бронювання') {
            if (count === 1) return 'бронювання';
            if (count < 5) return 'бронювання';
            return 'бронювань';
        }
        return itemName;
    };

    return (
        <div className={`text-sm text-gray-500 ${className}`}>
            Показано{' '}
            <span className="text-gray-400 font-semibold">
                {startItem}–{endItem}
            </span>
            {' '}з{' '}
            <span className="text-gray-400 font-semibold">{totalCount}</span>
            {' '}{getItemNameForm(totalCount)}
        </div>
    );
};