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
    
    private async Task EnsureUserExistsAsync(int userId)
    {
        var exists = await _context.Users.AnyAsync(u => u.Id == userId);
        if (!exists)
            throw new KeyNotFoundException($"User with ID {userId} does not exist");
    }

    private async Task<decimal> CalculateTotalPrice(int bookingId)
    {
        var totalPrice = await _context.Tickets
            .Where(ticket => ticket.BookingId == bookingId && ticket.IsActive)
            .SumAsync(ticket => ticket.ActualPrice);

        return totalPrice;
    }
    
    public async Task<List<AdminBookingDto>> GetAllBookingsAsync(BookingFilterDto filter)
    {
        var bookingsQuery = _context.Bookings
            .Include(b => b.Tickets)
            .AsQueryable();

        bookingsQuery = ApplySorting(ApplyFilter(bookingsQuery, filter), filter);

        var bookings = await bookingsQuery.ToListAsync();

        var result = new List<AdminBookingDto>();

        foreach (var booking in bookings)
        {
            var totalPrice = await CalculateTotalPrice(booking.Id);
            result.Add(new AdminBookingDto
            {
                Id = booking.Id,
                UserId = booking.UserId,
                BookingTime = booking.BookingTime,
                Status = booking.Status,
                Tickets = booking.Tickets.Select(TicketBookingDto.TicketToTicketBookingDto).ToList(),
                TotalPrice = totalPrice
            });
        }

        return result;
    }
    
    public async Task<List<BookingDto>> GetBookingsForUserAsync(int userId)
    {
        await EnsureUserExistsAsync(userId);

        var bookings = await _context.Bookings
            .Where(booking => booking.UserId == userId)
            .OrderByDescending(booking => booking.BookingTime)
            .Include(booking => booking.Tickets)
            .ToListAsync();

        var result = new List<BookingDto>();

        foreach (var booking in bookings)
        {
            var totalPrice = await CalculateTotalPrice(booking.Id);
            result.Add(new BookingDto
            {
                Id = booking.Id,
                BookingTime = booking.BookingTime,
                Status = booking.Status,
                Tickets = booking.Tickets.Select(ticket => new TicketBookingDto
                {
                    Id = ticket.Id,
                    SessionId = ticket.SessionId,
                    SeatId = ticket.SeatId,
                    ActualPrice = ticket.ActualPrice,
                    IsActive = ticket.IsActive
                }).ToList(),
                TotalPrice = totalPrice
            });
        }

        return result;
    }

    
    public async Task<BookingDto> GetBookingByIdAsync(int userId, int bookingId)
    {
        var booking = await _context.Bookings
            .Include(b => b.Tickets)
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);
        
        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {bookingId} for user {userId} not found.");

        var totalPrice = await CalculateTotalPrice(bookingId);
        
        return new BookingDto
        {
            Id = booking.Id,
            BookingTime = booking.BookingTime,
            Status = booking.Status,
            Tickets = booking.Tickets
                .Select(TicketBookingDto.TicketToTicketBookingDto)
                .ToList(),
            TotalPrice = totalPrice
        };
    }

    
    public async Task<AdminBookingDto> GetBookingByIdAsync(int bookingId)
    {
        var booking = await _context.Bookings
            .Include(b => b.Tickets)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {bookingId} not found.");

        var totalPrice = await CalculateTotalPrice(bookingId);
        
        return new AdminBookingDto
        {
            Id = booking.Id,
            UserId =  booking.UserId,
            BookingTime = booking.BookingTime,
            Status = booking.Status,
            Tickets = booking.Tickets
                .Select(TicketBookingDto.TicketToTicketBookingDto)
                .ToList(),
            TotalPrice = totalPrice
        };
    }
    
    public async Task<BookingDto> CreateBookingAsync(int userId)
    {
        await EnsureUserExistsAsync(userId);
        
        var booking = new Booking
        {
            UserId = userId,
            BookingTime = DateTime.Now,
            Status = BookingStatus.Inprogress
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return new BookingDto
        {
            Id = booking.Id,
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
/*
        if (filter.SessionId != null)
            query = query.Where(b => b.Tickets.Any(t => t.SessionSeat.SessionId == filter.SessionId));*/

        if (filter.FromDate != null)
            query = query.Where(booking => booking.BookingTime >= filter.FromDate.Value);

        if (filter.ToDate != null)
            query = query.Where(booking => booking.BookingTime <= filter.ToDate.Value);

        return query;
    }
    
    private static IQueryable<Booking> ApplySorting(IQueryable<Booking> query, BookingFilterDto filter)
    {
        var sortBy = filter.SortBy?.ToLower();
        var sortOrder = filter.SortOrder?.ToLower() == "asc";

        return sortBy switch
        {
            "date" => sortOrder
                ? query.OrderBy(booking => booking.BookingTime)
                : query.OrderByDescending(b => b.BookingTime),

            "status" => sortOrder
                ? query.OrderBy(booking => booking.Status)
                : query.OrderByDescending(booking => booking.Status),

            "userid" => sortOrder
                ? query.OrderBy(booking => booking.UserId)
                : query.OrderByDescending(booking => booking.UserId),

            _ => query.OrderByDescending(booking => booking.BookingTime) // default
        };
    }

}