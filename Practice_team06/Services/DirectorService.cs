using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs;
using Practice_team06.Models;

namespace Practice_team06.Services;

public class DirectorService : IDirectorService
{
     private readonly PostgresContext _context;

    public DirectorService(PostgresContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DirectorDto>> GetAllAsync(string? search = null, string? sortBy = null, bool isDescending = false)
    {
        // 1. Починаємо формувати запит до таблиці Directors
        var query = _context.Directors.AsQueryable();

        // 2. Пошук (Filtering)
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(a => a.FirstName.ToLower().Contains(s) 
                                  || a.LastName.ToLower().Contains(s));
        }

        // 3. Сортування (Sorting)
        if (!string.IsNullOrWhiteSpace(sortBy))
        {
            query = sortBy.ToLower() switch
            {
                "firstname" => isDescending ? query.OrderByDescending(a => a.FirstName) : query.OrderBy(a => a.FirstName),
                "lastname"  => isDescending ? query.OrderByDescending(a => a.LastName) : query.OrderBy(a => a.LastName),
                "id"        => isDescending ? query.OrderByDescending(a => a.Id) : query.OrderBy(a => a.Id),
                _           => query.OrderBy(a => a.Id) // за замовчуванням
            };
        }
        else
        {
            query = query.OrderBy(a => a.Id);
        }

        // 4. Перетворення в DTO та виконання запиту
        return await query
            .Select(a => new DirectorDto
            {
                Id = a.Id,
                FirstName = a.FirstName,
                LastName = a.LastName,
                PhotoUri = a.PhotoUri
            })
            .ToListAsync();
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

    public async Task<DirectorDto> CreateAsync(CreateDirectorDto directorDto)
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
}