using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Common;
using Practice_team06.DTOs.Genre;
using Practice_team06.DTOs.Language;
using Practice_team06.Extensions;
using Practice_team06.Models;

namespace Practice_team06.Services;

public class LanguageService : ILanguageService
{
    private readonly PostgresContext _context;
    private readonly IMapper _mapper;

    public LanguageService(PostgresContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PagedResult<LanguageDto>> GetAllAsync(LanguageFilterDto filter)
    {
        var query = _context.Languages.AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var s = filter.Search.Trim().ToLower();
            query = query.Where(l => l.Name.ToLower().Contains(s));
        }

        var totalCount = await query.CountAsync();

        query = ApplySorting(query, filter.SortBy, filter.IsDescending);

        query = query.ApplyPagination(filter);

        var items = await query
            .ProjectTo<LanguageDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return new PagedResult<LanguageDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page ?? 1,
            PageSize = filter.PageSize ?? 6
        };
    }

    public async Task<LanguageDto?> GetByIdAsync(int id)
    {
        return await _context.Languages
            .AsNoTracking()
            .Where(l => l.Id == id)
            .ProjectTo<LanguageDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();
    }

    public async Task<LanguageDto> CreateAsync(CreateLanguageDto dto)
    {
        var language = _mapper.Map<Language>(dto);

        _context.Languages.Add(language);
        await _context.SaveChangesAsync();

        return _mapper.Map<LanguageDto>(language);
    }

    public async Task<IEnumerable<LanguageDto>> CreateRangeAsync(IEnumerable<CreateLanguageDto> dto)
    {
        var languages = _mapper.Map<List<Language>>(dto);

        await _context.Languages.AddRangeAsync(languages);
        await _context.SaveChangesAsync();

        return _mapper.Map<IEnumerable<LanguageDto>>(languages);
    }

    public async Task<bool> UpdateAsync(int id, CreateLanguageDto dto)
    {
        var language = await _context.Languages.FindAsync(id);
        if (language == null) return false;

        _mapper.Map(dto, language);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var language = await _context.Languages.FindAsync(id);
        if (language == null) return false;

        _context.Languages.Remove(language);
        await _context.SaveChangesAsync();

        return true;
    }

    private static IQueryable<Language> ApplySorting(
        IQueryable<Language> query,
        string? sortBy,
        bool isDescending)
    {
        if (string.IsNullOrWhiteSpace(sortBy))
            return query.OrderBy(l => l.Id);

        return sortBy.ToLower() switch
        {
            "name" => isDescending
                ? query.OrderByDescending(l => l.Name)
                : query.OrderBy(l => l.Name),

            "id" => isDescending
                ? query.OrderByDescending(l => l.Id)
                : query.OrderBy(l => l.Id),

            _ => query.OrderBy(l => l.Id)
        };
    }
}
