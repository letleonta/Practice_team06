using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Booking;
using Practice_team06.DTOs.Ticket;
using Practice_team06.Models;

namespace Practice_team06.Services;

public class BookingService : IBookingService
{
    private readonly PostgresContext _context;

    public BookingService(PostgresContext context)
    {
        _context = context;
    }
    
    public async Task<List<AdminBookingDto>> GetAllBookingsAsync(BookingFilterDto filter)
    {
        var bookingsQuery = _context.Bookings
            .AsQueryable();

        bookingsQuery = ApplySorting(ApplyFilter(bookingsQuery, filter), filter);

        var bookings = await bookingsQuery
            .Include(booking => booking.Tickets)
            .ThenInclude(ticket => ticket.Seat)
            .ThenInclude(seat => seat.Hall)
            .ToListAsync();

        var result = bookings.Select(booking => new AdminBookingDto
        {
            Id = booking.Id,
            UserId = booking.UserId,
            SessionId = booking.SessionId,
            BookingTime = booking.BookingTime,
            Status = booking.Status,
            Tickets = booking.Tickets
                .Select(TicketBookingDto.TicketToTicketBookingDto)
                .ToList(),
            TotalPrice = booking.Tickets
                .Where(ticket => ticket.IsActive)
                .Sum(ticket => ticket.ActualPrice)
        }).ToList();

        return result;
    }
    
    public async Task<List<BookingDto>> GetBookingsForUserAsync(int userId)
    {
        var bookings = await _context.Bookings
            .Where(booking => booking.UserId == userId)
            .OrderByDescending(booking => booking.BookingTime)
            .Include(booking => booking.Tickets)
            .ThenInclude(ticket => ticket.Seat)
            .ThenInclude(seat => seat.Hall)
            .ToListAsync();

        var result = bookings.Select(booking => new BookingDto
        {
            Id = booking.Id,
            SessionId = booking.SessionId,
            BookingTime = booking.BookingTime,
            Status = booking.Status,
            Tickets = booking.Tickets
                .Select(TicketBookingDto.TicketToTicketBookingDto)
                .ToList(),
            TotalPrice = booking.Tickets
                .Where(ticket => ticket.IsActive)
                .Sum(ticket => ticket.ActualPrice)
        }).ToList();

        return result;
    }

    
    public async Task<BookingDto> GetBookingByIdAsync(int userId, int bookingId)
    {
        var booking = await _context.Bookings
            .Include(b => b.Tickets)
            .ThenInclude(ticket => ticket.Seat)
            .ThenInclude(seat => seat.Hall)
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);
        
        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {bookingId} for user {userId} not found.");
        
        return new BookingDto
        {
            Id = booking.Id,
            SessionId = booking.SessionId,
            BookingTime = booking.BookingTime,
            Status = booking.Status,
            Tickets = booking.Tickets
                .Select(TicketBookingDto.TicketToTicketBookingDto)
                .ToList(),
            TotalPrice = booking.Tickets
                .Where(ticket => ticket.IsActive)
                .Sum(ticket => ticket.ActualPrice)
        };
    }

    
    public async Task<AdminBookingDto> GetBookingByIdAsync(int bookingId)
    {
        var booking = await _context.Bookings
            .Include(b => b.Tickets)
            .ThenInclude(ticket => ticket.Seat)
            .ThenInclude(seat => seat.Hall)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {bookingId} not found.");
        
        return new AdminBookingDto
        {
            Id = booking.Id,
            UserId =  booking.UserId,
            SessionId = booking.SessionId,
            BookingTime = booking.BookingTime,
            Status = booking.Status,
            Tickets = booking.Tickets
                .Select(TicketBookingDto.TicketToTicketBookingDto)
                .ToList(),
            TotalPrice = booking.Tickets
                .Where(ticket => ticket.IsActive)
                .Sum(ticket => ticket.ActualPrice)
        };
    }
    
    public async Task<BookingDto> CreateBookingAsync(int userId, CreateBookingDto dto)
    {
        var sessionExists = await _context.Sessions.AnyAsync(s => s.Id == dto.SessionId);
        if (!sessionExists)
            throw new KeyNotFoundException($"Session with ID {dto.SessionId} not found");
        
        var booking = new Booking
        {
            UserId = userId,
            SessionId = dto.SessionId,
            BookingTime = DateTime.Now,
            Status = BookingStatus.Inprogress
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return new BookingDto
        {
            Id = booking.Id,
            SessionId = booking.SessionId,
            BookingTime = booking.BookingTime,
            Status = booking.Status,
            Tickets = new List<TicketBookingDto>(),
            TotalPrice = 0
        };
    }

    public Task ConfirmBookingAsync(int userId, int bookingId)
    {
        return ChangeBookingStatusAsync(userId, bookingId, BookingStatus.Paid);
    }

    public Task CancelBookingAsync(int userId, int bookingId)
    {
        return ChangeBookingStatusAsync(userId, bookingId, BookingStatus.Cancelled);
    }

    public async Task ChangeBookingStatusAsync(int userId, int bookingId, BookingStatus newStatus)
    {
        var booking = await _context.Bookings
            .FirstOrDefaultAsync(b =>
                b.Id == bookingId &&
                b.UserId == userId);

        if (booking == null)
            throw new KeyNotFoundException("Booking not found");

        if (booking.Status == BookingStatus.Cancelled)
            throw new InvalidOperationException("Cancelled booking cannot be changed");

        if (booking.Status == BookingStatus.Paid &&  newStatus == BookingStatus.Paid)
            throw new InvalidOperationException("Booking has been already paid");

        booking.Status = newStatus;

        await _context.SaveChangesAsync();
    }
    
    public async Task DeleteBookingAsync(int bookingId)
    {
        var booking = await _context.Bookings.FindAsync(bookingId);
        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {bookingId} not found.");

        _context.Bookings.Remove(booking);
        await _context.SaveChangesAsync();
    }

    private static IQueryable<Booking> ApplyFilter(IQueryable<Booking> query, BookingFilterDto filter)
    {
        if (filter.Status != null)
            query = query.Where(booking => booking.Status == filter.Status);

        if (filter.UserId != null)
            query = query.Where(booking => booking.UserId == filter.UserId);

        if (filter.SessionId != null)
            query = query.Where(b => b.SessionId == filter.SessionId);

        if (filter.FromDate != null)
            query = query.Where(booking => booking.BookingTime >= filter.FromDate.Value);

        if (filter.ToDate != null)
            query = query.Where(booking => booking.BookingTime <= filter.ToDate.Value);

        return query;
    }
    
    private static IQueryable<Booking> ApplySorting(IQueryable<Booking> query, BookingFilterDto filter)
    {
        var sortBy = filter.SortBy?.ToLower();
        var isDescending = filter.IsDescending.GetValueOrDefault(false);

        return sortBy switch
        {
            "date" => isDescending
                ? query.OrderByDescending(booking => booking.BookingTime)
                : query.OrderBy(booking => booking.BookingTime),

            "status" => isDescending
                ? query.OrderByDescending(booking => booking.Status)
                : query.OrderBy(booking => booking.Status),

            "userid" => isDescending
                ? query.OrderByDescending(booking => booking.UserId)
                : query.OrderBy(booking => booking.UserId),

            _ => query.OrderByDescending(booking => booking.BookingTime) // default
        };
    }

}