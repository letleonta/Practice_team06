import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export const Pagination = ({
                               currentPage,
                               totalPages,
                               onPageChange,
                               className = ''
                           }: PaginationProps) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = (): (number | 'ellipsis')[] => {
        const pages: (number | 'ellipsis')[] = [];
        const maxVisible = 7;

        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Always show first page
        pages.push(1);

        if (currentPage <= 3) {
            // Near start: [1] 2 3 4 5 ... 10
            for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
                pages.push(i);
            }
            if (totalPages > 5) pages.push('ellipsis');
        } else if (currentPage >= totalPages - 2) {
            // Near end: 1 ... 6 7 8 9 [10]
            if (totalPages > 5) pages.push('ellipsis');
            for (let i = Math.max(totalPages - 4, 2); i < totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Middle: 1 ... 4 [5] 6 ... 10
            pages.push('ellipsis');
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                pages.push(i);
            }
            pages.push('ellipsis');
        }

        // Always show last page
        pages.push(totalPages);

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className={`flex justify-center items-center gap-2 ${className}`}>
            {/* Previous Button */}
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="p-3 rounded-full bg-gray-800 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-800 transition-all"
                aria-label="Previous page"
            >
                <ChevronLeft size={20} />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-2">
                {pageNumbers.map((page, index) => {
                    if (page === 'ellipsis') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-2 text-gray-500 select-none"
                            >
                                ...
                            </span>
                        );
                    }

                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`min-w-[44px] h-11 px-4 rounded-full font-bold transition-all ${
                                page === currentPage
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
                                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
                            }`}
                            aria-label={`Page ${page}`}
                            aria-current={page === currentPage ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            {/* Next Button */}
            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="p-3 rounded-full bg-gray-800 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-800 transition-all"
                aria-label="Next page"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};