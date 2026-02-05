using Practice_team06.DTOs.Common;

namespace Practice_team06.Extensions;

public static class QueryableExtensions
{
    public static IQueryable<T> ApplyPagination<T>(this IQueryable<T> query, int page, int pageSize)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        return query
            .Skip((page - 1) * pageSize)
            .Take(pageSize);
    }

    public static IQueryable<T> ApplyPagination<T>(this IQueryable<T> query, BaseFilterDto filter)
    {
        return query.ApplyPagination(filter.Page ?? 1, filter.PageSize ?? 10);
    }
}