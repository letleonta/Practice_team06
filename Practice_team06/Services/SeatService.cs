using Microsoft.EntityFrameworkCore;
using Practice_team06.Models;
using Practice_team06.DTOs.Seat;

namespace Practice_team06.Services;

public class SeatService : ISeatService
{
    private readonly PostgresContext _context;

    public SeatService(PostgresContext context) => _context = context;

    public async Task<IEnumerable<SeatDto>> GetSeatsByHallAsync(int hallId)
    {
        return await _context.Seats
            .Where(s => s.HallId == hallId)
            .OrderBy(s => s.RowNumber).ThenBy(s => s.SeatNumber)
            .Select(s => new SeatDto {
                Id = s.Id,
                HallId = s.HallId,
                RowNumber = s.RowNumber,
                SeatNumber = s.SeatNumber,
                PriceModifier = s.PriceModifier,
                SeatType = s.SeatType,
            }).ToListAsync();
    }

    public async Task<SeatDto?> GetByIdAsync(int id)
    {
        var s = await _context.Seats.FindAsync(id);
        if (s == null) return null;

        return new SeatDto {
            Id = s.Id, HallId = s.HallId, RowNumber = s.RowNumber,
            SeatNumber = s.SeatNumber, PriceModifier = s.PriceModifier,
            SeatType = s.SeatType,
        };
    }

    public async Task<SeatDto?> UpdateSeatAsync(int id, UpdateSeatDto dto)
    {
        var seat = await _context.Seats.FindAsync(id);
        if (seat == null) return null;

        seat.SeatType = dto.SeatType;
        seat.PriceModifier = dto.PriceModifier;

        await _context.SaveChangesAsync();

        return new SeatDto {
            Id = seat.Id, HallId = seat.HallId, RowNumber = seat.RowNumber,
            SeatNumber = seat.SeatNumber, PriceModifier = seat.PriceModifier,
            SeatType = seat.SeatType,
        };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var seat = await _context.Seats.FindAsync(id);
        if (seat == null) return false;

        _context.Seats.Remove(seat);
        await _context.SaveChangesAsync();
        return true;
    }
    
    public async Task<IEnumerable<SessionSeatDto>> GetSeatsForSessionAsync(int sessionId)
    {
        
        var session = await _context.Sessions
            .Include(s => s.Movie)
            .Include(s => s.Hall)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        if (session == null) return Enumerable.Empty<SessionSeatDto>();
        
        var occupiedSeatIds = await _context.Tickets
            .Where(t => t.SessionId == sessionId && t.IsActive)
            .Select(t => t.SeatId)
            .ToListAsync();
        
        var allSeats = await _context.Seats
            .Where(s => s.HallId == session.HallId)
            .OrderBy(s => s.RowNumber)
            .ThenBy(s => s.SeatNumber)
            .ToListAsync();
        
        return allSeats.Select(seat => new SessionSeatDto
        {
            SeatId = seat.Id,
            RowNumber = seat.RowNumber,
            SeatNumber = seat.SeatNumber,
            Type = seat.SeatType,
            IsAvailable = !occupiedSeatIds.Contains(seat.Id),
            Price = session.Movie.BasePrice * session.Hall.PriceModifier * seat.PriceModifier
        });
    }
}