export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export function createPagedResult<T>(
    items: T[],
    totalCount: number,
    page: number,
    pageSize: number
): PagedResult<T> {
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        items,
        totalCount,
        page,
        pageSize,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages
    };
}
