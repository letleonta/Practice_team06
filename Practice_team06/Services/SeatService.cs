using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Practice_team06.Models;
using Practice_team06.DTOs.Seat;

namespace Practice_team06.Services;

public class SeatService : ISeatService
{
    private readonly PostgresContext _context;
    private readonly IMapper _mapper;

    public SeatService(PostgresContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<SeatDto> AddSeatToRowAsync(int hallId, int rowNumber)
    {
        var lastSeatNumber = await _context.Seats
            .Where(s => s.HallId == hallId && s.RowNumber == rowNumber)
            .MaxAsync(s => (int?)s.SeatNumber) ?? 0;

        var newSeat = new Seat
        {
            HallId = hallId,
            RowNumber = (short)rowNumber,
            SeatNumber = (short)(lastSeatNumber + 1),
            SeatType = SeatType.Standard,
            PriceModifier = 1.0m
        };

        _context.Seats.Add(newSeat);
        await _context.SaveChangesAsync();

        return _mapper.Map<SeatDto>(newSeat);
    }

    public async Task<bool> DeleteRowAsync(int hallId, int rowNumber)
    {
        var seatsInRow = await _context.Seats
            .Where(s => s.HallId == hallId && s.RowNumber == rowNumber)
            .ToListAsync();

        if (!seatsInRow.Any()) return false;

        var seatIds = seatsInRow.Select(s => s.Id).ToList();
        
        if (await _context.Tickets.AnyAsync(t => seatIds.Contains(t.SeatId)))
            throw new InvalidOperationException("Неможливо видалити ряд: є продані квитки.");

        _context.Seats.RemoveRange(seatsInRow);
        
        var rowsToShift = await _context.Seats
            .Where(s => s.HallId == hallId && s.RowNumber > rowNumber)
            .ToListAsync();

        foreach (var seat in rowsToShift)
        {
            seat.RowNumber--;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<SeatDto>> GetSeatsByHallAsync(int hallId)
    {
        return await _context.Seats
            .AsNoTracking()
            .Where(s => s.HallId == hallId)
            .OrderBy(s => s.RowNumber)
            .ThenBy(s => s.SeatNumber)
            .ProjectTo<SeatDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
    }

    public async Task<SeatDto?> GetByIdAsync(int id)
    {
        return await _context.Seats
            .AsNoTracking()
            .Where(s => s.Id == id)
            .ProjectTo<SeatDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();
    }

    public async Task<SeatDto?> UpdateSeatAsync(int id, UpdateSeatDto dto)
    {
        var seat = await _context.Seats.FirstOrDefaultAsync(s => s.Id == id);

        if (seat == null) return null;
        
        seat.SeatType = dto.SeatType;
        seat.PriceModifier = dto.PriceModifier;
        
        _context.Entry(seat).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return _mapper.Map<SeatDto>(seat);
    }
    
    public async Task<bool> DeleteAsync(int id)
    {
        var seat = await _context.Seats.FindAsync(id);
        if (seat == null) return false;

        if (await _context.Tickets.AnyAsync(t => t.SeatId == id))
            throw new InvalidOperationException("На це місце вже продано квитки.");

        int hallId = seat.HallId;
        int rowNum = seat.RowNumber;
        int seatNum = seat.SeatNumber;
        
        _context.Seats.Remove(seat);
        
        var remainingSeats = await _context.Seats
            .Where(s => s.HallId == hallId && s.RowNumber == rowNum && s.SeatNumber > seatNum)
            .ToListAsync();
        
        foreach (var s in remainingSeats)
        {
            s.SeatNumber--;
        }
        
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<SessionSeatDto>> GetSeatsForSessionAsync(int sessionId)
    {
        var session = await _context.Sessions
            .AsNoTracking()
            .Include(s => s.Movie)
            .Include(s => s.Hall)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        if (session == null) return Enumerable.Empty<SessionSeatDto>();

        var occupiedSeatIds = await _context.Tickets
            .AsNoTracking()
            .Where(t => t.SessionId == sessionId && t.IsActive)
            .Select(t => t.SeatId)
            .ToHashSetAsync();

        var allSeats = await _context.Seats
            .AsNoTracking()
            .Where(s => s.HallId == session.HallId)
            .OrderBy(s => s.RowNumber)
            .ThenBy(s => s.SeatNumber)
            .ToListAsync();

        decimal baseSessionPrice = session.Movie.BasePrice * session.Hall.PriceModifier;

        return allSeats.Select(seat =>
        {
            var dto = _mapper.Map<SessionSeatDto>(seat);
            dto.IsAvailable = !occupiedSeatIds.Contains(seat.Id);
            dto.Price = baseSessionPrice * seat.PriceModifier;
            return dto;
        });
    }

    public async Task ShiftRowAsync(int hallId, int rowNumber, int delta)
    {
        var seats = await _context.Seats
            .Where(s => s.HallId == hallId && s.RowNumber == rowNumber)
            .ToListAsync();

        if (!seats.Any()) return;

        var seatIds = seats.Select(s => s.Id).ToList();
        if (await _context.Tickets.AnyAsync(t => seatIds.Contains(t.SeatId)))
            throw new InvalidOperationException("Неможливо зсунути ряд: на місця вже продано квитки.");
        
        if (delta < 0 && seats.Min(s => s.SeatNumber) + delta < 1)
            throw new InvalidOperationException("Зсув неможливий: номер крісла не може бути меншим за 1.");

        foreach (var s in seats)
        {
            s.SeatNumber = (short)(s.SeatNumber + delta);
        }

        await _context.SaveChangesAsync();
    }
}