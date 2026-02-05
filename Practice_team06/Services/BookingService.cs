using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Booking;
using Practice_team06.DTOs.Booking.Stats;
using Practice_team06.DTOs.Common;
using Practice_team06.DTOs.Ticket;
using Practice_team06.Extensions;
using Practice_team06.Models;

namespace Practice_team06.Services;

public class BookingService : IBookingService
{
    private readonly PostgresContext _context;

    public BookingService(PostgresContext context)
    {
        _context = context;
    }
    
    public async Task<AdminBookingsWithStatsDto> GetAllBookingsAsync(BookingFilterDto filter)
    {
        var query = _context.Bookings.AsQueryable();

        query = ApplyFilter(query, filter);
        
        var totalCount = await query.CountAsync();

        query = ApplySorting(query, filter);
        
        var stats = await GetStats(query, filter);
            
        query = query.ApplyPagination(filter);

        var bookings = await query
            .AsNoTracking()
            .Include(b => b.Session)
            .ThenInclude(s => s.Movie)
            .Include(b => b.Tickets)
            .ThenInclude(t => t.Seat)
            .ThenInclude(s => s.Hall)
            .Include(b => b.User)
            .ToListAsync();

        var result = bookings.Select(MapToAdminBookingDto).ToList();

        return new AdminBookingsWithStatsDto
        {
            BookingsPage = new PagedResult<AdminBookingDto>
            {
                Items = result,
                TotalCount = totalCount,
                Page = filter.Page ?? 1,
                PageSize = filter.PageSize ?? 10
            },
            Stats = stats
        };
    }
    
    public async Task<PagedResult<BookingDto>> GetBookingsForUserAsync(int userId, BookingFilterDto filter)
    {
        var query = _context.Bookings
            .AsNoTracking()
            .Include(b => b.Session)
            .ThenInclude(s => s.Movie)
            .Include(b => b.Tickets)
            .ThenInclude(t => t.Seat)
            .ThenInclude(s => s.Hall)
            .Where(b => b.UserId == userId);

        query = ApplyFilter(query, filter);
        
        var totalCount = await query.CountAsync();

        query = ApplySorting(query, filter);
        query = query.ApplyPagination(filter);

        var bookings = await query.ToListAsync();
        var result = bookings.Select(MapToBookingDto).ToList();

        return new PagedResult<BookingDto>
        {
            Items = result,
            TotalCount = totalCount,
            Page = filter.Page ?? 1,
            PageSize = filter.PageSize ?? 10
        };
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

        return MapToBookingDto(booking);
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
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {bookingId} not found.");
        
        return MapToAdminBookingDto(booking);
    }
    
    public async Task<BookingDto> CreateBookingAsync(int userId, CreateBookingDto dto)
    {
        if (dto.SeatIds == null || !dto.SeatIds.Any())
            throw new ArgumentException("At least one seat must be selected.");
        
        var session = await _context.Sessions
            .Include(s => s.Movie)
            .Include(s => s.Hall)
            .FirstOrDefaultAsync(s => s.Id == dto.SessionId);

        if (session == null)
            throw new KeyNotFoundException($"Session with ID {dto.SessionId} not found.");

        if (session.StartTime < DateTime.Now)
            throw new InvalidOperationException($"Session with ID {dto.SessionId} has already started.");
        
        var seats = await _context.Seats
            .Where(s => dto.SeatIds.Contains(s.Id))
            .ToListAsync();

        if (seats.Count != dto.SeatIds.Count)
            throw new KeyNotFoundException("One or more seats not found.");
        
        var occupiedSeatIds = await _context.Tickets
            .Where(t => t.SessionId == dto.SessionId && t.IsActive)
            .Select(t => t.SeatId)
            .ToHashSetAsync();

        var takenSeats = dto.SeatIds.Where(id => occupiedSeatIds.Contains(id)).ToList();
        if (takenSeats.Count != 0)
            throw new InvalidOperationException($"Seats {string.Join(", ", takenSeats)} are already taken.");
        
        await using var transaction = await _context.Database.BeginTransactionAsync();
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
                SessionId = booking.SessionId,
                SeatId = seat.Id,
                IsActive = true,
                ActualPrice = CalculateTicketPrice(session, seat)
            }).ToList();
            _context.Tickets.AddRange(tickets);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return MapToBookingDtoWithTickets(booking, session, tickets);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task ConfirmBookingAsync(int userId, int bookingId)
    {
        var booking = await _context.Bookings
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);

        if (booking == null) throw new KeyNotFoundException("Бронювання не знайдено.");
    
        if (booking.Status == BookingStatus.Paid) 
            throw new InvalidOperationException("Бронювання вже оплачене.");
    
        if (booking.Status == BookingStatus.Cancelled)
            throw new InvalidOperationException("Неможливо оплатити скасоване бронювання.");

        booking.Status = BookingStatus.Paid;
        await _context.SaveChangesAsync();
    }

    public async Task CancelBookingAsync(int userId, int bookingId)
    {
        var booking = await _context.Bookings
            .Include(b => b.Session)
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);

        if (booking == null) throw new KeyNotFoundException("Бронювання не знайдено.");

        var timeUntilSession = booking.Session.StartTime - DateTime.UtcNow;
        var minutesRemaining = timeUntilSession.TotalMinutes;
        
        if (minutesRemaining < 0)
        {
            throw new InvalidOperationException("Сеанс вже почався або закінчився.");
        }
        if (minutesRemaining < 30)
        {
            throw new InvalidOperationException($"Запізно для скасування. До сеансу залишилося {Math.Round(minutesRemaining)} хв. (мінімум 30)");
        }

        if (booking.Status == BookingStatus.Cancelled) return;

        booking.Status = BookingStatus.Cancelled;
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

    private static decimal CalculateTicketPrice(Session session, Seat seat)
    {
        return session.Movie.BasePrice * session.Hall.PriceModifier * seat.PriceModifier;
    }

    private static BookingDto MapToBookingDto(Booking booking)
    {
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
            TotalPrice = CalculateTotalPrice(booking.Tickets)
        };
    }

    private static AdminBookingDto MapToAdminBookingDto(Booking booking)
    {
        return new AdminBookingDto
        {
            Id = booking.Id,
            UserEmail = !string.IsNullOrEmpty(booking.User.Email) ? booking.User.Email : "Не вказано",
            Title = booking.Session.Movie.Title,
            AgeRestriction = booking.Session.Movie.AgeRestriction,
            PosterUri = booking.Session.Movie.PosterUri,
            StartTime = booking.Session.StartTime,
            BookingTime = booking.BookingTime,
            Status = booking.Status,
            Tickets = booking.Tickets
                .Select(TicketBookingDto.TicketToTicketBookingDto)
                .ToList(),
            TotalPrice = CalculateTotalPrice(booking.Tickets)
        };
    }

    private static BookingDto MapToBookingDtoWithTickets(Booking booking, Session session, List<Ticket> tickets)
    {
        return new BookingDto
        {
            Id = booking.Id,
            Title = session.Movie.Title,
            AgeRestriction = session.Movie.AgeRestriction,
            PosterUri = session.Movie.PosterUri,
            StartTime = session.StartTime,
            BookingTime = booking.BookingTime,
            Status = booking.Status,
            Tickets = tickets
                .Select(TicketBookingDto.TicketToTicketBookingDto)
                .ToList(),
            TotalPrice = CalculateTotalPrice(tickets)
        };
    }

    private static decimal CalculateTotalPrice(IEnumerable<Ticket> tickets)
    {
        return tickets
            .Where(t => t.IsActive)
            .Sum(t => t.ActualPrice);
    }

    private async Task<BookingsStatsDto> GetStats(IQueryable<Booking> query, BookingFilterDto filter)
    {
        DateTime endDate = filter.BookingToDate ?? DateTime.UtcNow;
        DateTime startDate = filter.BookingFromDate ?? endDate.AddDays(-30);
        return new BookingsStatsDto
        {
            TotalCount = await query.CountAsync(),
            InProgressCount = await query.CountAsync(b => b.Status == BookingStatus.Inprogress),
            PaidCount = await query.CountAsync(b => b.Status == BookingStatus.Paid),
            CancelledCount = await query.CountAsync(b => b.Status == BookingStatus.Cancelled),
            TotalRevenue = await query.Where(b => b.Status == BookingStatus.Paid)
                                .SelectMany(b => b.Tickets)
                                .SumAsync(t => t.ActualPrice),
            RevenuePoints = await query
                .Where(b => b.Status == BookingStatus.Paid && b.BookingTime >= startDate && b.BookingTime <= endDate)
                .GroupBy(b => b.BookingTime.Date)
                .Select(g => new RevenuePointDto 
                {
                    Date = g.Key,
                    Amount = g.SelectMany(b => b.Tickets).Sum(t => t.ActualPrice)
                })
                .OrderBy(p => p.Date)
                .ToListAsync(),
            HallPoints = await query
                .Where(b => b.Status == BookingStatus.Paid 
                            && b.BookingTime >= startDate 
                            && b.BookingTime <= endDate)
                .SelectMany(b => b.Tickets)
                .GroupBy(t => t.Booking.Session.Hall.Name)
                .Select(g => new HallPointDto 
                {
                    HallName = g.Key,
                    Number = g.Sum(t => t.ActualPrice)
                })
                .OrderByDescending(p => p.Number)
                .Take(5)
                .ToListAsync(),
            GenrePoints = await query
                .Where(b => b.Status == BookingStatus.Paid 
                            && b.BookingTime >= startDate 
                            && b.BookingTime <= endDate)
                .SelectMany(b => b.Tickets) 
                .SelectMany(t => t.Booking.Session.Movie.MovieGenres)
                .GroupBy(mg => mg.Genre.Name)
                .Select(g => new GenrePointDto
                {
                    GenreName = g.Key,
                    Number = g.Count() 
                })
                .OrderByDescending(p => p.Number)
                .Take(5)
                .ToListAsync()
        };
    }

    private static IQueryable<Booking> ApplyFilter(IQueryable<Booking> query, BookingFilterDto filter)
    {
        if (filter.Status != null)
            query = query.Where(b => b.Status == filter.Status);

        if (filter.SessionId != null)
            query = query.Where(b => b.SessionId == filter.SessionId);

        if (filter.BookingFromDate != null)
            query = query.Where(b => b.BookingTime >= filter.BookingFromDate.Value);

        if (filter.BookingToDate != null)
            query = query.Where(b => b.BookingTime <= filter.BookingToDate.Value);
        
        if (filter.SessionFromDate != null)
            query = query.Where(b => b.Session.StartTime >= filter.SessionFromDate.Value);

        if (filter.SessionToDate != null)
            query = query.Where(b => b.Session.StartTime <= filter.SessionToDate.Value);

        if (!string.IsNullOrEmpty(filter.UserEmail))
        {
            query = query.Where(b =>
                b.User.Email!.ToLower().Contains(filter.UserEmail));
        }
        
        if (!string.IsNullOrEmpty(filter.SearchQuery))
        {
            query = query.Where(b => 
                b.Id.ToString().Contains(filter.SearchQuery)
                || b.Session.Movie.Title.ToLower().Contains(filter.SearchQuery));
        }

        return query;
    }
    
    private static IQueryable<Booking> ApplySorting(IQueryable<Booking> query, BookingFilterDto filter)
    {
        var sortBy = filter.SortBy?.ToLower();
        var isDescending = filter.IsDescending.GetValueOrDefault(false);

        return sortBy switch
        {
            "date" => isDescending
                ? query.OrderByDescending(b => b.BookingTime)
                : query.OrderBy(b => b.BookingTime),

            "status" => isDescending
                ? query.OrderByDescending(b => b.Status)
                : query.OrderBy(b => b.Status),

            "useremail" => isDescending
                ? query.OrderByDescending(b => b.User.Email)
                : query.OrderBy(b => b.User.Email),

            _ => query.OrderByDescending(b => b.BookingTime)
        };
    }
}