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

    private async Task<decimal> CalculatePriceAsync(int sessionId, int seatId)
    {
        var session = await _context.Sessions.FirstOrDefaultAsync(s => s.Id == sessionId);
        if (session == null)
            throw new KeyNotFoundException($"Session with ID {sessionId} does not exist.");
        var movie = await _context.Movies
            .FirstOrDefaultAsync(m => m.Id == session.MovieId);
        if  (movie == null)
            throw new KeyNotFoundException($"Movie with ID {session.MovieId} does not exist.");
        var seat = await _context.Seats.FirstOrDefaultAsync(s => s.Id == seatId);
        if (seat == null)
            throw new KeyNotFoundException($"Seat with ID {seatId} does not exist.");
        var hall = await _context.Halls.FirstOrDefaultAsync(h => h.Id == seat.HallId);
        if (hall == null)
            throw new KeyNotFoundException($"Hall with ID {seat.HallId} does not exist.");
        return movie.BasePrice * hall.PriceModifier * seat.PriceModifier;
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