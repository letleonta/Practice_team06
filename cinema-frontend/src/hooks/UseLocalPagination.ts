import { useState, useEffect, useCallback, useRef } from 'react';
import type { PagedResult } from "../types/common.ts";

interface UseLocalPaginationOptions {
    pageSize?: number;
    resetOnFilterChange?: boolean;
}

export function useLocalPagination<T>(
    fetchFunction: (page: number, pageSize: number, ...args: any[]) => Promise<PagedResult<T>>,
    dependencies: any[] = [],
    options: UseLocalPaginationOptions = {}
) {
    const { pageSize: defaultSize = 10, resetOnFilterChange = true } = options;

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(defaultSize);

    const [pagedResult, setPagedResult] = useState<PagedResult<T>>({
        items: [],
        totalCount: 0,
        page: 1,
        pageSize: defaultSize,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (resetOnFilterChange) {
            setCurrentPage(1);
        }
    }, dependencies);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFunction(currentPage, pageSize, ...dependencies);
            setPagedResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Fetch error');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, ...dependencies]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const goToPage = useCallback((page: number) => {
        if (page >= 1 && (pagedResult.totalPages === 0 || page <= pagedResult.totalPages)) {
            setCurrentPage(page);
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

    return {
        items: pagedResult.items,
        totalCount: pagedResult.totalCount,
        currentPage: currentPage,
        pageSize: pageSize,
        totalPages: pagedResult.totalPages,
        hasPreviousPage: pagedResult.hasPreviousPage,
        hasNextPage: pagedResult.hasNextPage,
        loading,
        error,
        goToPage,
        goToNextPage,
        goToPreviousPage,
        refresh: fetchData,
        pagedResult
    };
}