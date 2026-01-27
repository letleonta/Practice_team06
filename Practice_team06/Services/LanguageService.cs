using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Language;
using Practice_team06.Models;

namespace Practice_team06.Services;

public class LanguageService : ILanguageService
{
    private readonly PostgresContext _context;

    public LanguageService(PostgresContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<LanguageDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        bool isDescending = false)
    {
        var query = _context.Languages.AsQueryable();

        // Filtering
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(l => l.Name.ToLower().Contains(s));
        }

        // Sorting
        if (!string.IsNullOrWhiteSpace(sortBy))
        {
            query = sortBy.ToLower() switch
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
        else
        {
            query = query.OrderBy(l => l.Id);
        }

        return await query
            .Select(l => new LanguageDto
            {
                Id = l.Id,
                Name = l.Name
            })
            .ToListAsync();
    }

    public async Task<LanguageDto?> GetByIdAsync(int id)
    {
        var language = await _context.Languages.FindAsync(id);
        if (language == null) return null;

        return new LanguageDto
        {
            Id = language.Id,
            Name = language.Name
        };
    }

    public async Task<LanguageDto> CreateAsync(CreateLanguageDto dto)
    {
        var language = new Language
        {
            Name = dto.Name
        };

        _context.Languages.Add(language);
        await _context.SaveChangesAsync();

        return new LanguageDto
        {
            Id = language.Id,
            Name = language.Name
        };
    }

    public async Task<IEnumerable<LanguageDto>> CreateRangeAsync(IEnumerable<CreateLanguageDto> dto)
    {
        var languages = dto.Select(d => new Language
        {
            Name = d.Name
        }).ToList();

        await _context.Languages.AddRangeAsync(languages);
        await _context.SaveChangesAsync();

        return languages.Select(l => new LanguageDto
        {
            Id = l.Id,
            Name = l.Name
        });
    }

    public async Task<bool> UpdateAsync(int id, CreateLanguageDto dto)
    {
        var language = await _context.Languages.FindAsync(id);
        if (language == null) return false;

        language.Name = dto.Name;
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
