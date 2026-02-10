import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { PagedResult } from "../types/common.ts";

interface UsePaginationOptions {
    pageSize?: number;
    resetOnFilterChange?: boolean;
    mode?: 'url' | 'local';
    key?: string;
    pageSizeKey?: string;
    scrollToTop?: boolean;
}

export function UsePagination<T>(
    fetchFunction: (page: number, pageSize: number, ...args: any[]) => Promise<PagedResult<T>>,
    dependencies: any[] = [],
    options: UsePaginationOptions = {}
) {
    const {
        pageSize: defaultSize = 10,
        resetOnFilterChange = true,
        mode = 'url',
        key = 'Page',
        pageSizeKey = 'PageSize',
        scrollToTop = true
    } = options;

    const [searchParams, setSearchParams] = useSearchParams();
    const [localPage, setLocalPage] = useState(1);

    // Використовуємо useRef для fetchFunction, щоб уникнути циклів,
    // якщо користувач передає анонімну функцію без useCallback
    const fetchFunctionRef = useRef(fetchFunction);
    useEffect(() => {
        fetchFunctionRef.current = fetchFunction;
    }, [fetchFunction]);

    const currentPage = mode === 'url'
        ? (Number(searchParams.get(key)) || 1)
        : localPage;

    const pageSize = mode === 'url'
        ? (Number(searchParams.get(pageSizeKey)) || defaultSize)
        : defaultSize;

    const [pagedResult, setPagedResult] = useState<PagedResult<T>>({
        items: [], totalCount: 0, page: currentPage, pageSize,
        totalPages: 0, hasPreviousPage: false, hasNextPage: false
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const prevDepsRef = useRef(dependencies);
    const isFirstRender = useRef(true);

    const setPage = useCallback((newPage: number) => {
        if (mode === 'url') {
            const newParams = new URLSearchParams(window.location.search); // Використовуємо актуальні параметри
            newParams.set(key, newPage.toString());
            newParams.set(pageSizeKey, pageSize.toString());
            setSearchParams(newParams);

            if (scrollToTop) window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setLocalPage(newPage);
        }
    }, [mode, key, pageSizeKey, pageSize, setSearchParams, scrollToTop]);

    // Слідкуємо за зміною залежностей (фільтрів)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const depsChanged = dependencies.some((dep, i) => dep !== prevDepsRef.current[i]);
        if (resetOnFilterChange && depsChanged) {
            // Важливо: скидаємо на 1 сторінку тільки якщо змінилися фільтри
            setPage(1);
        }
        prevDepsRef.current = dependencies;
    }, [dependencies, resetOnFilterChange, setPage]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Викликаємо актуальну функцію з ref
            const result = await fetchFunctionRef.current(currentPage, pageSize, ...dependencies);
            setPagedResult(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Fetch error');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, ...dependencies]); // ТУТ ми прибрали fetchFunction з залежностей

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const goToPage = useCallback((page: number) => {
        if (page >= 1 && (pagedResult.totalPages === 0 || page <= pagedResult.totalPages)) {
            setPage(page);
        }
    }, [pagedResult.totalPages, setPage]);

    return {
        items: pagedResult.items,
        totalCount: pagedResult.totalCount,
        currentPage,
        pageSize,
        totalPages: pagedResult.totalPages,
        hasPreviousPage: pagedResult.hasPreviousPage,
        hasNextPage: pagedResult.hasNextPage,
        loading,
        error,
        goToPage,
        goToNextPage: () => pagedResult.hasNextPage && goToPage(currentPage + 1),
        goToPreviousPage: () => pagedResult.hasPreviousPage && goToPage(currentPage - 1),
        refresh: fetchData,
        pagedResult
    };
}