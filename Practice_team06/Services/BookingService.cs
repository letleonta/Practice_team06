using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs;
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
    
    public async Task<List<AdminBookingDto>> GetAllBookingsAsync(BookingFilterDto filter)
    {
        var bookingsQuery = _context.Bookings
            .Include(b => b.Tickets) // отримуємо всі квитки одним JOIN
            .AsQueryable();

        bookingsQuery = ApplySorting(ApplyFilter(bookingsQuery, filter), filter);

        var bookings = await bookingsQuery.ToListAsync();

        return bookings.Select(b => new AdminBookingDto
        {
            Id = b.Id,
            UserId = b.UserId,
            BookingTime = b.BookingTime,
            Status = b.Status,
            Tickets = b.Tickets.Select(TicketBookingDto.TicketToTicketBookingDto).ToList()
        }).ToList();
    }

    
    public async Task<List<BookingDto>> GetBookingsForUserAsync(int userId)
    {
        await EnsureUserExistsAsync(userId);

        var bookings = await _context.Bookings
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.BookingTime)
            .Select(b => new BookingDto
            {
                Id = b.Id,
                BookingTime = b.BookingTime,
                Status = b.Status,
                Tickets = b.Tickets.Select(TicketBookingDto.TicketToTicketBookingDto).ToList()
            })
            .ToListAsync();

        return bookings;
    }
    
    public async Task<BookingDto> GetBookingByIdAsync(int userId, int bookingId)
    {
        var booking = await _context.Bookings
            .Include(b => b.Tickets)
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);
        
        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {bookingId} for user {userId} not found.");

        return new BookingDto
        {
            Id = booking.Id,
            BookingTime = booking.BookingTime,
            Status = booking.Status,
            Tickets = booking.Tickets
                .Select(TicketBookingDto.TicketToTicketBookingDto)
                .ToList()
        };
    }

    
    public async Task<AdminBookingDto> GetBookingByIdAsync(int bookingId)
    {
        var booking = await _context.Bookings
            .Include(b => b.Tickets)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {bookingId} not found.");

        return new AdminBookingDto
        {
            Id = booking.Id,
            UserId =  booking.UserId,
            BookingTime = booking.BookingTime,
            Status = booking.Status,
            Tickets = booking.Tickets
                .Select(TicketBookingDto.TicketToTicketBookingDto)
                .ToList()
        };
    }
    
    public async Task<Booking> CreateBookingAsync(int userId)
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

        return booking;
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
            query = query.Where(b => b.Status == filter.Status);

        if (filter.UserId != null)
            query = query.Where(b => b.UserId == filter.UserId);
/*
        if (filter.SessionId != null)
            query = query.Where(b => b.Tickets.Any(t => t.SessionSeat.SessionId == filter.SessionId));*/

        if (filter.FromDate != null)
            query = query.Where(b => b.BookingTime >= filter.FromDate.Value);

        if (filter.ToDate != null)
            query = query.Where(b => b.BookingTime <= filter.ToDate.Value);

        return query;
    }
    
    private static IQueryable<Booking> ApplySorting(IQueryable<Booking> query, BookingFilterDto filter)
    {
        var sortBy = filter.SortBy?.ToLower();
        var sortOrder = filter.SortOrder?.ToLower() == "asc";

        return sortBy switch
        {
            "date" => sortOrder
                ? query.OrderBy(b => b.BookingTime)
                : query.OrderByDescending(b => b.BookingTime),

            "status" => sortOrder
                ? query.OrderBy(b => b.Status)
                : query.OrderByDescending(b => b.Status),

            "userid" => sortOrder
                ? query.OrderBy(b => b.UserId)
                : query.OrderByDescending(b => b.UserId),

            _ => query.OrderByDescending(b => b.BookingTime) // default
        };
    }

}