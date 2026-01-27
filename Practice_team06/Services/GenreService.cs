using Microsoft.EntityFrameworkCore;
using Practice_team06.Models;
using Practice_team06.DTOs.Genre;

namespace Practice_team06.Services;

public class GenreService : IGenreService
{
    private readonly PostgresContext _context;

    public GenreService(PostgresContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<GenreDto>> GetAllAsync(string? search = null, string? sortBy = null, bool isDescending = false)
    {
        // 1. Базовий запит
        var query = _context.Genres.AsQueryable();

        // 2. Пошук
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(g => g.Name.ToLower().Contains(s));
        }

        // 3. Сортування
        if (!string.IsNullOrWhiteSpace(sortBy))
        {
            query = sortBy.ToLower() switch
            {
                "name" => isDescending ? query.OrderByDescending(g => g.Name) : query.OrderBy(g => g.Name),
                "id"   => isDescending ? query.OrderByDescending(g => g.Id) : query.OrderBy(g => g.Id),
                _      => query.OrderBy(g => g.Id)
            };
        }
        else
        {
            query = query.OrderBy(g => g.Id);
        }

        // 4. DTO
        return await query
            .Select(g => new GenreDto
            {
                Id = g.Id,
                Name = g.Name
            })
            .ToListAsync();
    }

    public async Task<GenreDto?> GetByIdAsync(int id)
    {
        var genre = await _context.Genres.FindAsync(id);
        if (genre == null) return null;

        return new GenreDto
        {
            Id = genre.Id,
            Name = genre.Name
        };
    }

    public async Task<GenreDto> CreateAsync(CreateGenreDto genreDto)
    {
        var genre = new Genre
        {
            Name = genreDto.Name
        };

        _context.Genres.Add(genre);
        await _context.SaveChangesAsync();

        return new GenreDto
        {
            Id = genre.Id,
            Name = genre.Name
        };
    }

    public async Task<IEnumerable<GenreDto>> CreateRangeAsync(IEnumerable<CreateGenreDto> genresDto)
    {
        var genres = genresDto.Select(dto => new Genre
        {
            Name = dto.Name
        }).ToList();

        await _context.Genres.AddRangeAsync(genres);
        await _context.SaveChangesAsync();

        return genres.Select(g => new GenreDto
        {
            Id = g.Id,
            Name = g.Name
        });
    }

    public async Task<bool> UpdateAsync(int id, CreateGenreDto genreDto)
    {
        var genre = await _context.Genres.FindAsync(id);
        if (genre == null) return false;

        genre.Name = genreDto.Name;
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
}
