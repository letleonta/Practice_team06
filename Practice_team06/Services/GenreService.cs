using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Practice_team06.Models;
using Practice_team06.DTOs.Genre;
using Practice_team06.DTOs.Common;
using Practice_team06.Extensions;

namespace Practice_team06.Services;

public class GenreService : IGenreService
{
    private readonly PostgresContext _context;
    private readonly IMapper _mapper;

    public GenreService(PostgresContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PagedResult<GenreDto>> GetAllAsync(GenreFilterDto filter)
    {
        var query = _context.Genres.AsQueryable();

        // ===== Пошук =====
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var s = filter.Search.Trim().ToLower();
            query = query.Where(g => g.Name.ToLower().Contains(s));
        }

        // ===== Кількість записів =====
        var totalCount = await query.CountAsync();

        // ===== Сортування =====
        query = ApplySorting(query, filter.SortBy, filter.IsDescending);

        // ===== Пагінація =====
        // Тепер filter має Page і PageSize від BaseFilterDto
        query = query.ApplyPagination(filter);

        // ===== DTO =====
        var items = await query
            .ProjectTo<GenreDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return new PagedResult<GenreDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page ?? 1,
            PageSize = filter.PageSize ?? 6
        };
    }

    public async Task<GenreDto?> GetByIdAsync(int id)
    {
        return await _context.Genres
            .AsNoTracking()
            .Where(g => g.Id == id)
            .ProjectTo<GenreDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();
    }

    public async Task<GenreDto> CreateAsync(CreateGenreDto genreDto)
    {
        var genre = _mapper.Map<Genre>(genreDto);

        _context.Genres.Add(genre);
        await _context.SaveChangesAsync();

        return _mapper.Map<GenreDto>(genre);
    }

    public async Task<IEnumerable<GenreDto>> CreateRangeAsync(IEnumerable<CreateGenreDto> genresDto)
    {
        var genres = _mapper.Map<List<Genre>>(genresDto);

        await _context.Genres.AddRangeAsync(genres);
        await _context.SaveChangesAsync();

        return _mapper.Map<IEnumerable<GenreDto>>(genres);
    }

    public async Task<bool> UpdateAsync(int id, CreateGenreDto genreDto)
    {
        var genre = await _context.Genres.FindAsync(id);
        if (genre == null) return false;

        _mapper.Map(genreDto, genre);
        
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var genre = await _context.Genres.FindAsync(id);
        if (genre == null) return false;

        _context.Genres.Remove(genre);
        await _context.SaveChangesAsync();

        return true;
    }

    private static IQueryable<Genre> ApplySorting(IQueryable<Genre> query, string? sortBy, bool isDescending)
    {
        if (string.IsNullOrWhiteSpace(sortBy))
        {
            return query.OrderBy(g => g.Id);
        }

        return sortBy.ToLower() switch
        {
            "name" => isDescending
                ? query.OrderByDescending(g => g.Name)
                : query.OrderBy(g => g.Name),

            "id" => isDescending
                ? query.OrderByDescending(g => g.Id)
                : query.OrderBy(g => g.Id),

            _ => query.OrderBy(g => g.Id)
        };
    }
}