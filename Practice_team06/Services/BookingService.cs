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
            .Include(b => b.Session)
            .ThenInclude(s => s.Movie)
            .Include(b => b.Tickets)
            .ThenInclude(t => t.Seat)
            .ThenInclude(s => s.Hall)
            .ToListAsync();

        var result = bookings.Select(booking => new AdminBookingDto
        {
            Id = booking.Id,
            UserId = booking.UserId,
            Title = booking.Session.Movie.Title,
            AgeRestriction = booking.Session.Movie.AgeRestriction,
            PosterUri = booking.Session.Movie.PosterUri,
            StartTime = booking.Session.StartTime,
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
    
    public async Task<List<BookingDto>> GetBookingsForUserAsync(int userId, BookingFilterDto filter)
    {
        var query = _context.Bookings
            .AsNoTracking()
            .Include(b => b.Session)
            .ThenInclude(s => s.Movie)
            .Include(b => b.Tickets)
            .ThenInclude(t => t.Seat)
            .ThenInclude(s => s.Hall)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.BookingTime)
            .AsQueryable();

        query = ApplySorting(ApplyFilter(query, filter), filter);

        var bookings = await query.ToListAsync();
        
        return bookings.Select(b => new BookingDto
        {
            Id = b.Id,
            Title = b.Session.Movie.Title,
            AgeRestriction = b.Session.Movie.AgeRestriction,
            PosterUri = b.Session.Movie.PosterUri,
            StartTime = b.Session.StartTime,
            BookingTime = b.BookingTime,
            Status = b.Status,
            Tickets = b.Tickets
                .Select(TicketBookingDto.TicketToTicketBookingDto)
                .ToList(),
            TotalPrice = b.Tickets
                .Where(t => t.IsActive)
                .Sum(t => t.ActualPrice)
        }).ToList();
    }
    
    public async Task<BookingDto> GetBookingByIdAsync(int userId, int bookingId)
    {
        var booking = await _context.Bookings
            .AsNoTracking()
            .Include(b => b.Session)
            .ThenInclude(s => s.Movie)
            .Include(b => b.Tickets)
            .ThenInclude(t => t.Seat)
            .ThenInclude(s => s.Hall)
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);

        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {bookingId} for user {userId} not found.");

        return new BookingDto
        {
            Id = booking.Id,
            Title = booking.Session.Movie.Title,
            AgeRestriction = booking.Session.Movie.AgeRestriction,
            PosterUri = booking.Session.Movie.PosterUri,
            StartTime = booking.Session.StartTime,
            BookingTime = booking.BookingTime,
            Status = booking.Status,
            Tickets = booking.Tickets
                .Select(TicketBookingDto.TicketToTicketBookingDto)
                .ToList(),
            TotalPrice = booking.Tickets
                .Where(t => t.IsActive)
                .Sum(t => t.ActualPrice)
        };
    }
    
    public async Task<AdminBookingDto> GetBookingByIdAsync(int bookingId)
    {
        var booking = await _context.Bookings
            .AsNoTracking()
            .Include(b => b.Session)
            .ThenInclude(s => s.Movie)
            .Include(b => b.Tickets)
            .ThenInclude(t => t.Seat)
            .ThenInclude(s => s.Hall)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {bookingId} not found.");
        
        return new AdminBookingDto
        {
            Id = booking.Id,
            UserId =  booking.UserId,
            Title = booking.Session.Movie.Title,
            AgeRestriction = booking.Session.Movie.AgeRestriction,
            PosterUri = booking.Session.Movie.PosterUri,
            StartTime = booking.Session.StartTime,
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
        var session = await _context.Sessions
            .Include(session => session.Movie)
            .Include(session => session.Hall) 
            .FirstOrDefaultAsync(session => session.Id == dto.SessionId);
    
        if (session == null)
            throw new KeyNotFoundException($"Session with ID {dto.SessionId} not found");

        if (session.StartTime < DateTime.Now)
            throw new InvalidOperationException($"Session with ID {dto.SessionId} has already past");
        
        var seats = await _context.Seats
            .Where(s => dto.SeatIds.Contains(s.Id))
            .ToListAsync();

        if (seats.Count != dto.SeatIds.Count)
            throw new KeyNotFoundException("Одне або кілька місць не знайдено");
        
        var occupiedSeatIds = await _context.Tickets
            .Where(t => t.SessionId == dto.SessionId && t.IsActive)
            .Select(t => t.SeatId)
            .ToHashSetAsync();

        var takenSeats = dto.SeatIds.Where(id => occupiedSeatIds.Contains(id)).ToList();
        if (takenSeats.Any())
            throw new InvalidOperationException("Одне або кілька місць вже занято");
        
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var booking = new Booking
            {
                UserId = userId,
                SessionId = dto.SessionId,
                BookingTime = DateTime.Now,
                Status = BookingStatus.Paid
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            var tickets = seats.Select(seat => new Ticket
            {
                BookingId = booking.Id,
                SessionId = dto.SessionId,
                SeatId = seat.Id,
                IsActive = true,
                ActualPrice = session.Movie.BasePrice * session.Hall.PriceModifier * seat.PriceModifier
            }).ToList();

            _context.Tickets.AddRange(tickets);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return new BookingDto
            {
                Id = booking.Id,
                Title = session.Movie.Title,
                AgeRestriction = session.Movie.AgeRestriction,
                PosterUri = session.Movie.PosterUri,
                StartTime = session.StartTime,
                BookingTime = booking.BookingTime,
                Status = booking.Status,
                Tickets = booking.Tickets
                    .Select(TicketBookingDto.TicketToTicketBookingDto)
                    .ToList(),
                TotalPrice = tickets
                    .Sum(ticket => ticket.ActualPrice)
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
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

        if (filter.BookingFromDate != null)
            query = query.Where(booking => booking.BookingTime >= filter.BookingFromDate.Value);

        if (filter.BookingToDate != null)
            query = query.Where(booking => booking.BookingTime <= filter.BookingToDate.Value);
        
        if (filter.SessionFromDate != null)
            query = query.Where(booking => booking.Session.StartTime >= filter.SessionFromDate.Value);

        if (filter.SessionToDate != null)
            query = query.Where(booking => booking.Session.StartTime <= filter.SessionToDate.Value);

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

            "userId" => isDescending
                ? query.OrderByDescending(booking => booking.UserId)
                : query.OrderBy(booking => booking.UserId),

            _ => query.OrderByDescending(booking => booking.BookingTime) // default
        };
    }
}