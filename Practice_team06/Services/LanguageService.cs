using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Language;
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

    public async Task<IEnumerable<LanguageDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        bool isDescending = false)
    {
        var query = _context.Languages.AsNoTracking();

        // Пошук
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(l => l.Name.ToLower().Contains(s));
        }

        // Сортування
        query = !string.IsNullOrWhiteSpace(sortBy) && sortBy.ToLower() == "name"
            ? (isDescending ? query.OrderByDescending(l => l.Name) : query.OrderBy(l => l.Name))
            : (isDescending ? query.OrderByDescending(l => l.Id) : query.OrderBy(l => l.Id));

        return await query
            .ProjectTo<LanguageDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
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
}