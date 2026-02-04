using Microsoft.EntityFrameworkCore;
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

    public async Task<List<MovieDto>> GetAllMoviesAsync(MovieFilterDto? filter)
    {
        var moviesQuery = _context.Movies.AsQueryable();
        
        moviesQuery = ApplyFilter(moviesQuery, filter);

        var movies = await moviesQuery
            .Include(m => m.MovieGenres).ThenInclude(mg => mg.Genre) // Завантажуємо жанри
            .Include(m => m.Director)
            .Include(m => m.MovieActors).ThenInclude(ma => ma.Actor)
            .OrderByDescending(m => m.ReleaseDate)
            .ToListAsync();

        return movies.Select(MapToDto).ToList();
    }

    public async Task<List<MovieDto>> GetUpcomingMoviesAsync(MovieFilterDto? filter)
    {
        if (filter == null)
            filter = new MovieFilterDto();
        filter.SelectionType = SelectionType.Upcoming;
        return await GetAllMoviesAsync(filter);
    }
    
    public async Task<MovieDto?> GetMovieByIdAsync(int id)
    {
        var movie = await _context.Movies
            .Include(m => m.MovieGenres).ThenInclude(mg => mg.Genre)
            .Include(m => m.Director)
            .Include(m => m.MovieActors).ThenInclude(ma => ma.Actor)
            .FirstOrDefaultAsync(m => m.Id == id);

        return movie == null ? null : MapToDto(movie);
    }
    public async Task<List<MovieDto>> GetNowPlayingMoviesAsync(MovieFilterDto? filter)
    {
        if (filter == null)
            filter = new MovieFilterDto();
        filter.SelectionType = SelectionType.NowPlaying;
        return await GetAllMoviesAsync(filter);
    }

    public async Task<MovieDto> CreateMovieAsync(CreateMovieDto dto)
    {
        if (dto.StartDate.HasValue && dto.EndDate.HasValue)
        {
            if (dto.StartDate > dto.EndDate)
            {
                throw new ArgumentException("Дата закінчення прокату не може бути раніше за дату початку!");
            }
        }
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
            DirectorId = dto.DirectorId, 
            AgeRestriction = dto.AgeRestriction,
            Rating = dto.Rating 
        };
        // ЛОГІКА РЕЖИСЕРА, якщо ID передали, перевіряємо чи він існує
        if (dto.DirectorId.HasValue)
        {
            var directorExists = await _context.Directors.AnyAsync(d => d.Id == dto.DirectorId.Value);
            if (directorExists)
            {
                movie.DirectorId = dto.DirectorId.Value;
            }
            // Якщо не існує - просто ігноруємо, і DirectorId залишиться null
        }

        // Додаємо жанри за їх ID
        if (dto.GenreIds.Any())
        {
            var genres = await _context.Genres
                .Where(g => dto.GenreIds.Contains(g.Id))
                .ToListAsync();
            
            foreach (var genre in genres)
            {
                movie.MovieGenres.Add(new MovieGenre 
                { 
                    Genre = genre 
                });
            }
        }
        

        if (dto.ActorIds.Any())
        {
            var actors = await _context.Actors
                .Where(a => dto.ActorIds.Contains(a.Id))
                .ToListAsync();

            foreach (var actor in actors)
            {
                // Для Many-to-Many через проміжну таблицю створюємо запис зв'язку
                movie.MovieActors.Add(new MovieActor 
                { 
                    Actor = actor 
                });
            }
        }
        _context.Movies.Add(movie);
        await _context.SaveChangesAsync();
        await _context.Entry(movie).Reference(m => m.Director).LoadAsync();
        return MapToDto(movie);
    }
    public async Task<MovieDto> UpdateMovieAsync(int id, CreateMovieDto dto)
{
    //Валідація дат
    if (dto.StartDate.HasValue && dto.EndDate.HasValue && dto.StartDate > dto.EndDate)
    {
        throw new ArgumentException("Дата закінчення прокату не може бути раніше за дату початку!");
    }
    
    var movie = await _context.Movies
        .Include(m => m.MovieGenres)
        .Include(m => m.MovieActors)
        .FirstOrDefaultAsync(m => m.Id == id);

    if (movie == null)
    {
        throw new KeyNotFoundException($"Movie with ID {id} not found");
    }
    
    movie.Title = dto.Title;
    movie.Description = dto.Description;
    movie.DurationMin = dto.DurationMin;
    movie.ReleaseDate = dto.ReleaseDate;
    movie.BasePrice = dto.BasePrice;
    movie.StartDate = dto.StartDate;
    movie.EndDate = dto.EndDate;
    movie.PosterUri = dto.PosterUri;
    movie.TrailerUri = dto.TrailerUri;
    movie.AgeRestriction = dto.AgeRestriction;
    movie.Rating = dto.Rating;
    
    // Скидаємо старого
    movie.DirectorId = null; 
    
    if (dto.DirectorId.HasValue && dto.DirectorId.Value > 0)
    {
        // Перевіряємо, чи існує новий
        var directorExists = await _context.Directors.AnyAsync(d => d.Id == dto.DirectorId.Value);
        if (directorExists)
        {
            movie.DirectorId = dto.DirectorId.Value;
        }
    }
    // Очищаємо старий список
    movie.MovieGenres.Clear();
    
    if (dto.GenreIds.Any())
    {
        var genres = await _context.Genres
            .Where(g => dto.GenreIds.Contains(g.Id))
            .ToListAsync();
        foreach (var genre in genres)
        {
            movie.MovieGenres.Add(new MovieGenre 
            { 
                Genre = genre 
            });
        }
    }
    // Очищаємо старий список зв'язків
    movie.MovieActors.Clear();

    if (dto.ActorIds.Any())
    {
        var actors = await _context.Actors
            .Where(a => dto.ActorIds.Contains(a.Id))
            .ToListAsync();

        foreach (var actor in actors)
        {
            movie.MovieActors.Add(new MovieActor { Actor = actor });
        }
    }
    
    await _context.SaveChangesAsync();
    await _context.Entry(movie).Reference(m => m.Director).LoadAsync();

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
            Rating = m.Rating.HasValue ? (double)m.Rating.Value : 0.0,
            PosterUri = m.PosterUri,
            TrailerUri = m.TrailerUri,
            AgeRestriction = m.AgeRestriction.ToString(),
            StartDate = m.StartDate,
            EndDate = m.EndDate,
            // Якщо режисера немає - Unknown
            DirectorName = m.Director != null 
                ? $"{m.Director.FirstName} {m.Director.LastName}" 
                : "Unknown",
            Genres = m.MovieGenres
                .Select(mg => mg.Genre.Name)
                .ToList(),
            // Виводимо список акторів
            Actors = m.MovieActors
                .Select(ma => $"{ma.Actor.FirstName} {ma.Actor.LastName}")
                .ToList()
        };
    }
    
    private static IQueryable<Movie> ApplyFilter(IQueryable<Movie> query, MovieFilterDto? filter)
    {
        if (filter == null)
            return query;
        
        if (!string.IsNullOrEmpty(filter.Title))
            query = query.Where(m => m.Title.ToLower().Contains(filter.Title.ToLower()));
        
        if (filter.Rating != null)
            query = query.Where(m => m.Rating >= filter.Rating);

        if (filter.SelectionType != null)
        {
            var today =  DateOnly.FromDateTime(DateTime.Now);
            if (filter.SelectionType == SelectionType.NowPlaying)
                query = query.Where(m =>
                    (m.StartDate != null && m.EndDate != null && m.StartDate <= today && m.EndDate >= today)
                    ||
                    (m.StartDate == null && m.ReleaseDate <= today));
            else if (filter.SelectionType == SelectionType.Upcoming)
                query = query.Where(m => m.ReleaseDate > today);
        }
        
        if (filter.AgeRestrictions.Any())
        {
            query = query.Where(m => filter.AgeRestrictions.Contains(m.AgeRestriction));
        }

        if (filter.Genres.Any())
            query = query.Where(m => m.MovieGenres.Any(g => filter.Genres.Contains(g.Genre.Name)));

        return query;
    }
}