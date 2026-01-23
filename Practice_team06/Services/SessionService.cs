using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs;
using Practice_team06.Models;

namespace Practice_team06.Services;

public class SessionService : ISessionService
{
    private readonly PostgresContext _context;

    public SessionService(PostgresContext context)
    {
        _context = context;
    }

    public async Task<List<SessionDto>> GetSessionsByMovieIdAsync(int movieId)
    {
        var sessions = await _context.Sessions
            .Include(s => s.Hall)
            .Include(s => s.Language)
            .Include(s => s.Movie)
            .Where(s => s.MovieId == movieId && s.StartTime > DateTime.Now) // Тільки майбутні сеанси
            .OrderBy(s => s.StartTime)
            .ToListAsync();

        return sessions.Select(s => new SessionDto
        {
            Id = s.Id,
            MovieTitle = s.Movie.Title,
            HallId = s.HallId,
            HallName = s.Hall.Name,
            LanguageName = s.Language.Name,
            StartTime = s.StartTime,
            // Кінець сеансу = Початок + Тривалість фільму
            EndTime = s.StartTime.AddMinutes(s.Movie.DurationMin ?? 0) 
        }).ToList();
    }

    public async Task<SessionDto> CreateSessionAsync(CreateSessionDto dto)
    {
        // Отримуємо фільм,щоб знати його тривалість
        var movie = await _context.Movies.FindAsync(dto.MovieId);
        if (movie == null) throw new Exception("Movie not found");
        
        var duration = movie.DurationMin ?? 120; // дефолт 120 хв, якщо null
        var newSessionStart = dto.StartTime;
        var newSessionEnd = newSessionStart.AddMinutes(duration + 15); // +15 хв на прибирання

        // Overlap Logic
        var isOverlap = await _context.Sessions
            .Include(s => s.Movie)
            .Where(s => s.HallId == dto.HallId) // Дивимось тільки цей зал
            .AnyAsync(s => 
                // Логіка перетину інтервалів часу
                newSessionStart < s.StartTime.AddMinutes((s.Movie.DurationMin ?? 0) + 15) &&
                newSessionEnd > s.StartTime
            );

        if (isOverlap)
        {
            throw new Exception("Цей зал зайнятий у обраний час! Оберіть інший час або зал.");
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
        
        await _context.Entry(session).Reference(s => s.Hall).LoadAsync();
        await _context.Entry(session).Reference(s => s.Language).LoadAsync();
        
        return new SessionDto
        {
            Id = session.Id,
            MovieTitle = movie.Title,
            HallId = session.HallId,
            HallName = session.Hall.Name,
            LanguageName = session.Language.Name,
            StartTime = session.StartTime,
            EndTime = session.StartTime.AddMinutes(duration)
        };
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
}