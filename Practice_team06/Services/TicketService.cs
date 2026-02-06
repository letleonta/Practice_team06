using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Ticket;
using Practice_team06.Models;

namespace Practice_team06.Services;

public class TicketService : ITicketService
{
    private readonly PostgresContext _context;
    private readonly IMapper _mapper;

    public TicketService(PostgresContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<decimal> CalculatePriceAsync(int sessionId, int seatId)
    {
        var sessionData = await _context.Sessions
            .Where(s => s.Id == sessionId)
            .Select(s => new { s.Movie.BasePrice, s.Hall.PriceModifier })
            .FirstOrDefaultAsync() ?? throw new KeyNotFoundException($"Session {sessionId} not found.");

        var seatModifier = await _context.Seats
            .Where(s => s.Id == seatId)
            .Select(s => s.PriceModifier)
            .FirstOrDefaultAsync();

        return sessionData.BasePrice * sessionData.PriceModifier * seatModifier;
    }

    public async Task<List<AdminTicketDto>> GetTicketsForBookingAsync(int bookingId)
    {
        return await _context.Tickets
            .AsNoTracking()
            .Where(t => t.BookingId == bookingId)
            .ProjectTo<AdminTicketDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
    }

    public async Task<List<TicketBookingDto>> GetTicketsForUserBookingAsync(int userId, int bookingId)
    {
        return await _context.Tickets
            .AsNoTracking()
            .Where(t => t.BookingId == bookingId && t.Booking.UserId == userId)
            .ProjectTo<TicketBookingDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
    }
    
    public async Task<List<AdminTicketDto>> GetAllTicketsAsync()
    {
        return await _context.Tickets
            .AsNoTracking()
            .ProjectTo<AdminTicketDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
    }

    public async Task<AdminTicketDto> GetTicketByIdAsync(int ticketId)
    {
        var result = await _context.Tickets
            .AsNoTracking()
            .Where(t => t.Id == ticketId)
            .ProjectTo<AdminTicketDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return result ?? throw new KeyNotFoundException($"Ticket with ID {ticketId} not found.");
    }

    public async Task<TicketDto> GetTicketForUserByIdAsync(int userId, int ticketId)
    {
        var result = await _context.Tickets
            .AsNoTracking()
            .Where(t => t.Id == ticketId && t.Booking.UserId == userId)
            .ProjectTo<TicketDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return result ?? throw new KeyNotFoundException($"Ticket with ID {ticketId} for user {userId} not found.");
    }

    public async Task DeleteTicketAsync(int ticketId)
    {
        var ticket = await _context.Tickets.FindAsync(ticketId);
        if (ticket == null) throw new KeyNotFoundException($"Ticket with ID {ticketId} not found.");

        _context.Tickets.Remove(ticket);
        await _context.SaveChangesAsync();
    }
}