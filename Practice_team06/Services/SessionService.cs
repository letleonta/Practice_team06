using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Common;
using Practice_team06.DTOs.Session;
using Practice_team06.Extensions;
using Practice_team06.Models;

namespace Practice_team06.Services;

public class SessionService : ISessionService
{
    private readonly PostgresContext _context;
    private readonly IMapper _mapper;

    public SessionService(PostgresContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }
    
    public async Task<PagedResult<SessionDto>> GetAllSessionsAsync(SessionFilterDto filter)
    {
        var query = _context.Sessions
            .Include(s => s.Movie) 
            .AsNoTracking();

        if (filter.MovieId.HasValue) query = query.Where(s => s.MovieId == filter.MovieId);
        if (filter.HallId.HasValue) query = query.Where(s => s.HallId == filter.HallId);
        if (filter.DateFrom.HasValue) query = query.Where(s => s.StartTime >= filter.DateFrom.Value);
        if (filter.DateTo.HasValue) query = query.Where(s => s.StartTime <= filter.DateTo.Value);
        
        if (filter.IsActive.HasValue)
        {
            var now = DateTime.Now;
            if (filter.IsActive.Value)
            {
                query = query.Where(s => s.StartTime > now);
            }
            else
            {
                query = query.Where(s => s.StartTime <= now);
            }
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(s => s.StartTime)
            .ApplyPagination(filter)
            .ProjectTo<SessionDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return new PagedResult<SessionDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page ?? 1,
            PageSize = filter.PageSize ?? 10
        };
    }

    public async Task<PagedResult<SessionDto>> GetSessionsByMovieIdAsync(int movieId, SessionFilterDto filter)
    {
        filter.MovieId = movieId;
        return await GetAllSessionsAsync(filter);
    }

    public async Task<SessionDto?> GetSessionByIdAsync(int id)
    {
        return await _context.Sessions
            .AsNoTracking()
            .Where(s => s.Id == id)
            .ProjectTo<SessionDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();
    }
        
    public async Task<SessionDto> CreateSessionAsync(CreateSessionDto dto)
    {
        var movie = await _context.Movies.FindAsync(dto.MovieId);
        if (movie == null) throw new Exception("Movie not found");
        
        var duration = movie.DurationMin ?? 120;
        var newStart = dto.StartTime;
        var newEnd = newStart.AddMinutes(duration + 15);
        
        var isOverlap = await _context.Sessions
            .Include(s => s.Movie)
            .Where(s => s.HallId == dto.HallId) 
            .AnyAsync(s => newStart < s.StartTime.AddMinutes((s.Movie.DurationMin ?? 0) + 15) && newEnd > s.StartTime);

        if (isOverlap) throw new Exception("Цей зал зайнятий у обраний час!");
        
        var session = new Session
        {
            MovieId = dto.MovieId,
            HallId = dto.HallId,
            LanguageId = dto.LanguageId,
            StartTime = dto.StartTime
        };

        _context.Sessions.Add(session);
        await _context.SaveChangesAsync();
        
        return await GetSessionByIdAsync(session.Id) ?? throw new Exception("Error retrieving created session");
    }

    public async Task<SessionDto> UpdateSessionAsync(int id, CreateSessionDto dto)
    {
        var session = await _context.Sessions.FindAsync(id);
        if (session == null) throw new KeyNotFoundException("Session not found");

        var movie = await _context.Movies.FindAsync(dto.MovieId);
        if (movie == null) throw new Exception("Movie not found");

        var duration = movie.DurationMin ?? 120;
        var newStart = dto.StartTime;
        var newEnd = newStart.AddMinutes(duration + 15);
        
        var isOverlap = await _context.Sessions
            .Include(s => s.Movie)
            .Where(s => s.HallId == dto.HallId && s.Id != id)
            .AnyAsync(s => newStart < s.StartTime.AddMinutes((s.Movie.DurationMin ?? 0) + 15) && newEnd > s.StartTime);

        if (isOverlap) throw new Exception("Цей зал зайнятий у обраний час!");

        session.MovieId = dto.MovieId;
        session.HallId = dto.HallId;
        session.LanguageId = dto.LanguageId;
        session.StartTime = dto.StartTime;

        await _context.SaveChangesAsync();

        return await GetSessionByIdAsync(session.Id) ?? throw new Exception("Error retrieving updated session");
    }

    public async Task DeleteSessionAsync(int id)
    {
        var session = await _context.Sessions.FindAsync(id);
        if (session != null)
        {
            _context.Sessions.Remove(session);
            await _context.SaveChangesAsync();
        }
    }
    
    public async Task CreateBatchAsync(List<CreateSessionDto> dtos)
{
    if (dtos == null || !dtos.Any()) return;

    using var transaction = await _context.Database.BeginTransactionAsync();

    try
    {
        foreach (var dto in dtos)
        {
            var movie = await _context.Movies.FindAsync(dto.MovieId);
            if (movie == null) throw new Exception($"Фільм з ID {dto.MovieId} не знайдено");

            var duration = movie.DurationMin ?? 120;
            var newStart = dto.StartTime;
            var newEnd = newStart.AddMinutes(duration + 15); 
            
            var conflictingSession = await _context.Sessions
                .Include(s => s.Movie) 
                .AsNoTracking()
                .Where(s => s.HallId == dto.HallId)
                .Where(s => s.StartTime < newEnd && s.StartTime.AddMinutes((s.Movie.DurationMin ?? 120) + 15) > newStart)
                .FirstOrDefaultAsync();

            if (conflictingSession != null) 
            {
                var conflictEnd = conflictingSession.StartTime.AddMinutes((conflictingSession.Movie.DurationMin ?? 120) + 15);
                
                throw new InvalidOperationException(
                    $"Неможливо додати сеанс на {newStart:HH:mm}. " +
                    $"Зал зайнятий фільмом '{conflictingSession.Movie.Title}' " +
                    $"({conflictingSession.StartTime:HH:mm} - {conflictEnd:HH:mm})."
                );
            }

            var session = new Session
            {
                MovieId = dto.MovieId,
                HallId = dto.HallId,
                LanguageId = dto.LanguageId,
                StartTime = dto.StartTime
            };

            _context.Sessions.Add(session);
            await _context.SaveChangesAsync(); 
        }

        await transaction.CommitAsync();
    }
    catch (Exception)
    {
        await transaction.RollbackAsync();
        throw; 
    }
}
}