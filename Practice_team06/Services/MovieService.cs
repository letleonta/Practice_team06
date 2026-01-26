using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs;
using Practice_team06.DTOs.Movie;
using Practice_team06.Models;

namespace Practice_team06.Services;

public class MovieService : IMovieService
{
    private readonly PostgresContext _context;

    public MovieService(PostgresContext context)
    {
        _context = context;
    }

    public async Task<List<MovieDto>> GetAllMoviesAsync()
    {
        var movies = await _context.Movies
            .Include(m => m.Genres) // Завантажуємо жанри
            .OrderByDescending(m => m.ReleaseDate)
            .ToListAsync();

        return movies.Select(MapToDto).ToList();
    }

    public async Task<List<MovieDto>> GetUpcomingMoviesAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        var movies = await _context.Movies
            .Include(m => m.Genres)
            .Where(m => m.ReleaseDate > today) // Фільми, які ще не вийшли
            .ToListAsync();

        return movies.Select(MapToDto).ToList();
    }
    
    public async Task<MovieDto?> GetMovieByIdAsync(int id)
    {
        var movie = await _context.Movies
            .Include(m => m.Genres)
            .FirstOrDefaultAsync(m => m.Id == id);

        return movie == null ? null : MapToDto(movie);
    }

    public async Task<MovieDto> CreateMovieAsync(CreateMovieDto dto)
    {
        // Створюємо нову сутність
        var movie = new Movie
        {
            Title = dto.Title,
            Description = dto.Description,
            DurationMin = dto.DurationMin,
            ReleaseDate = dto.ReleaseDate,
            BasePrice = dto.BasePrice,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            PosterUri = dto.PosterUri,
            TrailerUri = dto.TrailerUri,
            AgeRestriction = dto.AgeRestriction
        };

        // Додаємо жанри за їх ID
        if (dto.GenreIds.Any())
        {
            var genres = await _context.Genres
                .Where(g => dto.GenreIds.Contains(g.Id))
                .ToListAsync();
            
            foreach (var genre in genres)
            {
                movie.Genres.Add(genre);
            }
        }

        _context.Movies.Add(movie);
        await _context.SaveChangesAsync();

        return MapToDto(movie);
    }

    public async Task DeleteMovieAsync(int id)
    {
        var movie = await _context.Movies.FindAsync(id);
        if (movie != null)
        {
            _context.Movies.Remove(movie);
            await _context.SaveChangesAsync();
        }
    }

    // Допоміжний метод для конвертації
    private static MovieDto MapToDto(Movie m)
    {
        return new MovieDto
        {
            Id = m.Id,
            Title = m.Title,
            Description = m.Description,
            DurationMin = m.DurationMin,
            ReleaseDate = m.ReleaseDate,
            BasePrice = m.BasePrice,
            Rating = (double?)m.Rating,
            PosterUri = m.PosterUri,
            AgeRestriction = m.AgeRestriction.ToString(),
            Genres = m.Genres.Select(g => g.Name).ToList()
        };
    }
}