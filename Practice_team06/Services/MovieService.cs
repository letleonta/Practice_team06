using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Common;
using Practice_team06.DTOs.Movie;
using Practice_team06.Extensions;
using Practice_team06.Models;

namespace Practice_team06.Services;

public class MovieService : IMovieService
{
    private readonly PostgresContext _context;
    private readonly IMapper _mapper; 

    public MovieService(PostgresContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PagedResult<MovieDto>> GetAllMoviesAsync(MovieFilterDto filter)
    {
        var query = _context.Movies.AsNoTracking();
        
        query = ApplyFilter(query, filter);
        
        var totalCount = await query.CountAsync();
        
        var items = await query
            .OrderByDescending(m => m.ReleaseDate)
            .ApplyPagination(filter)
            .ProjectTo<MovieDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
        
        return new PagedResult<MovieDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page ?? 1,
            PageSize = filter.PageSize ?? 10
        };
    }
    
    public async Task<PagedResult<MovieDto>> GetUpcomingMoviesAsync(MovieFilterDto filter)
    {
        filter.SelectionType = SelectionType.Upcoming;
        return await GetAllMoviesAsync(filter);
    }

    public async Task<PagedResult<MovieDto>> GetNowPlayingMoviesAsync(MovieFilterDto filter)
    {
        filter.SelectionType = SelectionType.NowPlaying;
        return await GetAllMoviesAsync(filter);
    }
    
    public async Task<MovieDto?> GetMovieByIdAsync(int id)
    {
        return await _context.Movies
            .AsNoTracking()
            .Where(m => m.Id == id)
            .ProjectTo<MovieDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();
    }

    public async Task<MovieDto> CreateMovieAsync(CreateMovieDto dto)
    {
        if (dto.StartDate.HasValue && dto.EndDate.HasValue && dto.StartDate > dto.EndDate)
            throw new ArgumentException("Дата закінчення прокату не може бути раніше за дату початку!");

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
            AgeRestriction = dto.AgeRestriction,
            Rating = dto.Rating
        };

        if (dto.DirectorId.HasValue)
        {
            if (await _context.Directors.AnyAsync(d => d.Id == dto.DirectorId.Value))
                movie.DirectorId = dto.DirectorId.Value;
        }

        if (dto.GenreIds.Any())
        {
            var genres = await _context.Genres.Where(g => dto.GenreIds.Contains(g.Id)).ToListAsync();
            foreach (var genre in genres) movie.MovieGenres.Add(new MovieGenre { Genre = genre });
        }

        if (dto.ActorIds.Any())
        {
            var actors = await _context.Actors.Where(a => dto.ActorIds.Contains(a.Id)).ToListAsync();
            foreach (var actor in actors) movie.MovieActors.Add(new MovieActor { Actor = actor });
        }
        
        _context.Movies.Add(movie);
        await _context.SaveChangesAsync();
        
        return await GetFullMovieDtoInternal(movie.Id);
    }

    public async Task<MovieDto> UpdateMovieAsync(int id, CreateMovieDto dto)
    {
        if (dto.StartDate.HasValue && dto.EndDate.HasValue && dto.StartDate > dto.EndDate)
            throw new ArgumentException("Дата закінчення прокату не може бути раніше за дату початку!");
        
        var movie = await _context.Movies
            .Include(m => m.MovieGenres)
            .Include(m => m.MovieActors)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (movie == null) throw new KeyNotFoundException($"Movie with ID {id} not found");
        
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
        movie.DirectorId = dto.DirectorId > 0 ? dto.DirectorId : null;
        
        movie.MovieGenres.Clear();
        if (dto.GenreIds.Any())
        {
            var genres = await _context.Genres.Where(g => dto.GenreIds.Contains(g.Id)).ToListAsync();
            foreach (var g in genres) movie.MovieGenres.Add(new MovieGenre { Genre = g });
        }

        movie.MovieActors.Clear();
        if (dto.ActorIds.Any())
        {
            var actors = await _context.Actors.Where(a => dto.ActorIds.Contains(a.Id)).ToListAsync();
            foreach (var a in actors) movie.MovieActors.Add(new MovieActor { Actor = a });
        }
        
        await _context.SaveChangesAsync();
        return await GetFullMovieDtoInternal(movie.Id);
    }

    public async Task DeleteMovieAsync(int id)
    {
        var movie = await _context.Movies
            .Include(m => m.Sessions) 
            .FirstOrDefaultAsync(m => m.Id == id);

        if (movie == null) return; 
        
        if (movie.Sessions.Any())
        {
            throw new InvalidOperationException($"Неможливо видалити фільм '{movie.Title}', оскільки у нього є історія сеансів.");
        }

        _context.Movies.Remove(movie);
        await _context.SaveChangesAsync();
    }

    // Приватний метод для отримання DTO після створення/оновлення
    private async Task<MovieDto> GetFullMovieDtoInternal(int id)
    {
        return await _context.Movies.AsNoTracking()
            .Where(m => m.Id == id)
            .ProjectTo<MovieDto>(_mapper.ConfigurationProvider)
            .FirstAsync();
    }
    
    private static IQueryable<Movie> ApplyFilter(IQueryable<Movie> query, MovieFilterDto? filter)
    {
        if (filter == null) return query;
        
        if (!string.IsNullOrEmpty(filter.Title))
            query = query.Where(m => m.Title.ToLower().Contains(filter.Title.ToLower()));
        
        if (filter.Rating != null)
            query = query.Where(m => m.Rating >= filter.Rating);

        if (filter.SelectionType != null)
        {
            var today = DateOnly.FromDateTime(DateTime.Now);
            if (filter.SelectionType == SelectionType.NowPlaying)
                query = query.Where(m => (m.StartDate != null && m.EndDate != null && m.StartDate <= today && m.EndDate >= today) || (m.StartDate == null && m.ReleaseDate <= today));
            else if (filter.SelectionType == SelectionType.Upcoming)
                query = query.Where(m => m.ReleaseDate > today);
        }
        
        if (filter.AgeRestrictions.Any())
            query = query.Where(m => filter.AgeRestrictions.Contains(m.AgeRestriction));

        if (filter.Genres.Any())
            query = query.Where(m => m.MovieGenres.Any(g => filter.Genres.Contains(g.Genre.Name)));

        return query;
    }
}