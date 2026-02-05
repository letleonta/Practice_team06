using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Common;
using Practice_team06.DTOs.Director;
using Practice_team06.Extensions;
using Practice_team06.Models;

namespace Practice_team06.Services;

public class DirectorService : IDirectorService
{
     private readonly PostgresContext _context;

    public DirectorService(PostgresContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<DirectorDto>> GetAllAsync(DirectorFilterDto filter)
    {
        var query = _context.Directors.AsQueryable();
    
        // 1. Фільтрація (Пошук)
        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var s = filter.Search.Trim().ToLower();
            query = query.Where(d => d.FirstName.ToLower().Contains(s) 
                                     || d.LastName.ToLower().Contains(s));
        }
        
        var totalCount = await query.CountAsync();
        
        query = ApplySorting(query, filter.SortBy, filter.IsDescending);
        
        query = query.ApplyPagination(filter);
        
        var items = await query
            .Select(d => new DirectorDto
            {
                Id = d.Id,
                FirstName = d.FirstName,
                LastName = d.LastName,
                PhotoUri = d.PhotoUri
            })
            .ToListAsync();
        
        return new PagedResult<DirectorDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page ?? 1,
            PageSize = filter.PageSize ?? 6
        };
    }

    public async Task<DirectorDto?> GetByIdAsync(int id)
    {
        var director = await _context.Directors.FindAsync(id);
        if (director == null) return null;

        return new DirectorDto
        {
            Id = director.Id,
            FirstName = director.FirstName,
            LastName = director.LastName,
            PhotoUri = director.PhotoUri
        };
    }

    public async Task<DirectorDto?> CreateAsync(CreateDirectorDto directorDto)
    {
        var director = new Director
        {
            FirstName = directorDto.FirstName,
            LastName = directorDto.LastName,
            PhotoUri = directorDto.PhotoUri
        };

        _context.Directors.Add(director);
        await _context.SaveChangesAsync();

        return new DirectorDto
        {
            Id = director.Id,
            FirstName = director.FirstName,
            LastName = director.LastName,
            PhotoUri = director.PhotoUri
        };
    }
    public async Task<IEnumerable<DirectorDto>> CreateRangeAsync(IEnumerable<CreateDirectorDto> directorsDto)
    {
        // 1. Перетворюємо список DTO у список моделей Director
        var directors = directorsDto.Select(dto => new Director
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PhotoUri = dto.PhotoUri
        }).ToList();

        // 2. Додаємо весь список одним махом
        await _context.Directors.AddRangeAsync(directors);
        await _context.SaveChangesAsync();

        // 3. Повертаємо список створених акторів з їхніми новими ID
        return directors.Select(a => new DirectorDto
        {
            Id = a.Id,
            FirstName = a.FirstName,
            LastName = a.LastName,
            PhotoUri = a.PhotoUri
        });
    }
    public async Task<bool> UpdateAsync(int id, CreateDirectorDto directorDto)
    {
        var director = await _context.Directors.FindAsync(id);
        if (director == null) return false;

        director.FirstName = directorDto.FirstName;
        director.LastName = directorDto.LastName;
        director.PhotoUri = directorDto.PhotoUri;

        await _context.SaveChangesAsync();
        return true;
    }
    
    public async Task<bool> DeleteAsync(int id)
    {
        var director = await _context.Directors.FindAsync(id);
        if (director == null) return false;

        _context.Directors.Remove(director);
        await _context.SaveChangesAsync();
        return true;
    }
    
    public async Task<IEnumerable<DirectorMovieDto>> GetDirectorMoviesAsync(int directorId)
    {
        return await _context.Movies
            .Where(m => m.DirectorId == directorId)
            .Select(m => new DirectorMovieDto
            {
                MovieId = m.Id,
                Title = m.Title,
                ReleaseDate = m.ReleaseDate
            })
            .ToListAsync();
    }
    
    private static IQueryable<Director> ApplySorting(IQueryable<Director> query, string? sortBy, bool isDescending)
    {
        if (string.IsNullOrWhiteSpace(sortBy))
        {
            return query.OrderBy(d => d.Id);
        }

        return sortBy.ToLower() switch
        {
            "firstname" => isDescending ? query.OrderByDescending(d => d.FirstName) : query.OrderBy(d => d.FirstName),
            "lastname"  => isDescending ? query.OrderByDescending(d => d.LastName) : query.OrderBy(d => d.LastName),
            "id"        => isDescending ? query.OrderByDescending(d => d.Id) : query.OrderBy(d => d.Id),
            _           => query.OrderBy(d => d.Id) 
        };
    }
}