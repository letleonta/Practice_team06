import { useState, useEffect, useCallback } from 'react';
import type { PagedResult } from '../types/pagedResult';

interface UsePaginationOptions {
    pageSize?: number;
    resetOnFilterChange?: boolean;
}

export function UsePagination<T>(
    fetchFunction: (page: number, pageSize: number, ...args: any[]) => Promise<PagedResult<T>>,
    dependencies: any[] = [],
    options: UsePaginationOptions = {}
) {
    const {
        pageSize = 10,
        resetOnFilterChange = true
    } = options;

    const [pagedResult, setPagedResult] = useState<PagedResult<T>>({
        items: [],
        totalCount: 0,
        page: 1,
        pageSize,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (resetOnFilterChange) {
            setCurrentPage(1);
        }
    }, dependencies);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await fetchFunction(currentPage, pageSize, ...dependencies);
                setPagedResult(result);
            } catch (err) {
                console.error('Pagination fetch error:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, ...dependencies]);

    const goToPage = useCallback((page: number) => {
        if (page >= 1 && page <= pagedResult.totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [pagedResult.totalPages]);

    const goToNextPage = useCallback(() => {
        if (pagedResult.hasNextPage) {
            goToPage(currentPage + 1);
        }
    }, [currentPage, pagedResult.hasNextPage, goToPage]);

    const goToPreviousPage = useCallback(() => {
        if (pagedResult.hasPreviousPage) {
            goToPage(currentPage - 1);
        }
    }, [currentPage, pagedResult.hasPreviousPage, goToPage]);

    const goToFirstPage = useCallback(() => {
        goToPage(1);
    }, [goToPage]);

    const goToLastPage = useCallback(() => {
        goToPage(pagedResult.totalPages);
    }, [pagedResult.totalPages, goToPage]);

    return {
        items: pagedResult.items,
        totalCount: pagedResult.totalCount,

        currentPage: pagedResult.page,
        pageSize: pagedResult.pageSize,
        totalPages: pagedResult.totalPages,
        hasPreviousPage: pagedResult.hasPreviousPage,
        hasNextPage: pagedResult.hasNextPage,

        loading,
        error,

        goToPage,
        goToNextPage,
        goToPreviousPage,
        goToFirstPage,
        goToLastPage,

        pagedResult
    };
}