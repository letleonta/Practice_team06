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

    public async Task<IEnumerable<SeatDto>> GetSeatsByHallAsync(int hallId)
    {
        return await _context.Seats
            .AsNoTracking()
            .Where(s => s.HallId == hallId)
            .OrderBy(s => s.RowNumber).ThenBy(s => s.SeatNumber)
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
        var seat = await _context.Seats.FindAsync(id);
        if (seat == null) return null;

        _mapper.Map(dto, seat);

        await _context.SaveChangesAsync();
        return _mapper.Map<SeatDto>(seat);
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
}