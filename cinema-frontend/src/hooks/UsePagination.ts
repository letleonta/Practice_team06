import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {PagedResult} from "../types/common.ts";

interface UsePaginationOptions {
    pageSize?: number;
    resetOnFilterChange?: boolean;
}

export function UsePagination<T>(
    fetchFunction: (page: number, pageSize: number, ...args: any[]) => Promise<PagedResult<T>>,
    dependencies: any[] = [],
    options: UsePaginationOptions = {}
) {
    const { pageSize: defaultSize = 10, resetOnFilterChange = true } = options;
    const [searchParams, setSearchParams] = useSearchParams();

    // Отримуємо поточну сторінку та розмір із URL
    const currentPage = Number(searchParams.get('Page')) || 1;
    const pageSize = Number(searchParams.get('PageSize')) || defaultSize;

    const [pagedResult, setPagedResult] = useState<PagedResult<T>>({
        items: [], totalCount: 0, page: currentPage, pageSize,
        totalPages: 0, hasPreviousPage: false, hasNextPage: false
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const prevDepsRef = useRef(dependencies);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const depsChanged = dependencies.some((dep, i) => dep !== prevDepsRef.current[i]);

        if (resetOnFilterChange && depsChanged) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set('Page', '1');

            setSearchParams(newParams, { replace: true });
        }

        prevDepsRef.current = dependencies;
    }, [dependencies, resetOnFilterChange, searchParams, setSearchParams]);

    const fetchData = useCallback(async () => {
        setLoading(true);
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
            const newParams = new URLSearchParams(searchParams);
            newParams.set('Page', page.toString());
            newParams.set('PageSize', pageSize.toString());

            setSearchParams(newParams);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [searchParams, setSearchParams, pageSize, pagedResult.totalPages]);

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

        refresh: fetchData,

        pagedResult
    };
}