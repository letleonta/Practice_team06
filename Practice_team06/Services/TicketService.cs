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

    public async Task<List<AdminTicketDto>> GetTicketsForBookingAsync(int bookingId)
    {
        var booking = await _context.Bookings
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {bookingId} not found.");
        
        var tickets = await _context.Tickets
            .Include(ticket => ticket.Seat)
            .Where(t => t.BookingId == booking.Id)
            .Select(t => AdminTicketDto.TicketToAdminTicketDto(t, booking.UserId))
            .ToListAsync();

        return tickets;
    }

    public async Task<List<TicketBookingDto>> GetTicketsForUserBookingAsync(int userId, int bookingId)
    {
        var booking = await _context.Bookings
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);

        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {bookingId} for user {userId} not found.");
        
        var tickets = await _context.Tickets
            .Include(ticket => ticket.Seat)
            .Where(t => t.BookingId == booking.Id)
            .Select(t => TicketBookingDto.TicketToTicketBookingDto(t))
            .ToListAsync();

        return tickets;
    }
    
    public async Task<List<AdminTicketDto>> GetAllTicketsAsync()
    {
        var tickets = await _context.Tickets
            .Include(ticket => ticket.Seat)
            .Select(ticket => AdminTicketDto.TicketToAdminTicketDto(ticket, ticket.Booking.UserId))
            .ToListAsync();
        
        return tickets;
    }

    public async Task<AdminTicketDto> GetTicketByIdAsync(int ticketId)
    {
        var ticket = await _context.Tickets
            .Include(ticket => ticket.Booking)
            .Include(ticket => ticket.Seat)
            .FirstOrDefaultAsync(t => t.Id == ticketId);

        if (ticket == null)
            throw new KeyNotFoundException($"Ticket with ID {ticketId} not found.");

        return AdminTicketDto.TicketToAdminTicketDto(ticket, ticket.Booking.UserId);
    }

    public async Task<TicketDto> GetTicketForUserByIdAsync(int userId, int ticketId)
    {
        var ticket = await _context.Tickets
            .Include(ticket => ticket.Booking)
            .Include(ticket => ticket.Seat)
            .FirstOrDefaultAsync(t => t.Id == ticketId && t.Booking.UserId == userId);

        if (ticket == null)
            throw new KeyNotFoundException($"Ticket with ID {ticketId} for user {userId} not found.");

        return TicketDto.TicketToTicketDto(ticket);
    }

    public async Task DeleteTicketAsync(int ticketId)
    {
        var ticket = await _context.Tickets.FindAsync(ticketId);
        if (ticket == null)
        {
            throw new KeyNotFoundException($"Ticket with ID {ticketId} not found.");
        }

        _context.Tickets.Remove(ticket);
        await _context.SaveChangesAsync();
    }
}