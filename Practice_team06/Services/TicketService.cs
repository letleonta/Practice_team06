using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Ticket;
using Practice_team06.Models;

namespace Practice_team06.Services;

public class TicketService : ITicketService
{
    private readonly PostgresContext _context;

    public TicketService(PostgresContext context)
    {
        _context = context;
    }

    public async Task<decimal> CalculatePriceAsync(int sessionId, int seatId)
    {
        var session = await _context.Sessions
            .Include(s => s.Movie)
            .FirstOrDefaultAsync(s => s.Id == sessionId);

        if (session == null) throw new KeyNotFoundException($"Session {sessionId} not found.");
        if (session.Movie == null) throw new KeyNotFoundException("Movie not found for this session.");

        var seat = await _context.Seats
            .Include(s => s.Hall)
            .FirstOrDefaultAsync(s => s.Id == seatId);

        if (seat == null) throw new KeyNotFoundException($"Seat {seatId} not found.");
        if (seat.Hall == null) throw new KeyNotFoundException("Hall not found for this seat.");

        return session.Movie.BasePrice * seat.Hall.PriceModifier * seat.PriceModifier;
    }
    
    public async Task<List<TicketBookingDto>> GetTicketsForUserAsync(int userId, int bookingId)
    {
        var booking = await _context.Bookings
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);

        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {bookingId} for user {userId} not found.");
        
        var tickets = await _context.Tickets
            .Where(t => t.BookingId == booking.Id)
            .Select(t => TicketBookingDto.TicketToTicketBookingDto(t))
            .ToListAsync();

        return tickets;
    }

    public async Task<TicketDto> CreateTicketAsync(int userId, int bookingId, CreateTicketDto dto)
    {
        var booking = await _context.Bookings
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);

        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {bookingId} for user {userId} not found.");
        if (booking.Status != BookingStatus.Inprogress)
            throw new InvalidOperationException($"Booking with ID {bookingId} is cancelled or already paid");

        try
        {
            var price = await CalculatePriceAsync(dto.SessionId, dto.SeatId);
            
            var ticket = new Ticket
            {
                BookingId = bookingId,
                SessionId = dto.SessionId,
                SeatId = dto.SeatId,
                ActualPrice = price
            };
        
            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            return TicketDto.TicketToTicketDto(ticket);
        }
        catch (KeyNotFoundException)
        {
            throw new KeyNotFoundException($"Session with ID {dto.SessionId} does not exist.");
        }
    }
    
    public async Task<List<AdminTicketDto>> GetAllTicketsAsync()
    {
        var tickets = await _context.Tickets
            .Select(ticket => AdminTicketDto.TicketToAdminTicketDto(ticket, ticket.Booking.UserId))
            .ToListAsync();
        
        return tickets;
    }

    public async Task<AdminTicketDto> GetTicketByIdAsync(int ticketId)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Booking)
            .FirstOrDefaultAsync(t => t.Id == ticketId);

        if (ticket == null)
            throw new KeyNotFoundException($"Ticket with ID {ticketId} not found.");

        return AdminTicketDto.TicketToAdminTicketDto(ticket, ticket.Booking.UserId);
    }
}