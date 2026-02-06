using AutoMapper;
using AutoMapper.QueryableExtensions;
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
    private readonly IMapper _mapper;
    
    public BookingService(PostgresContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PagedResult<AdminBookingDto>> GetAllBookingsAsync(BookingFilterDto filter)
    {
        var query = _context.Bookings.AsNoTracking();
        query = ApplyFilter(query, filter);
    
        var totalCount = await query.CountAsync();
        query = ApplySorting(query, filter);

        var items = await query
            .ApplyPagination(filter)
            .ProjectTo<AdminBookingDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return new PagedResult<AdminBookingDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page ?? 1,
            PageSize = filter.PageSize ?? 10
        };
    }

    public async Task<PagedResult<BookingDto>> GetBookingsForUserAsync(int userId, BookingFilterDto filter)
    {
        var query = _context.Bookings
            .AsNoTracking()
            .Where(b => b.UserId == userId);

        query = ApplyFilter(query, filter);
        var totalCount = await query.CountAsync();
        query = ApplySorting(query, filter);

        var items = await query
            .ApplyPagination(filter)
            .ProjectTo<BookingDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return new PagedResult<BookingDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page ?? 1,
            PageSize = filter.PageSize ?? 10
        };
    }

    public async Task<T> GetBookingByIdAsync<T>(int? userId, int bookingId, BaseFilterDto filter) 
        where T : class, IBookingWithTickets
    {
        var query = _context.Bookings.AsNoTracking();

        if (userId.HasValue)
            query = query.Where(b => b.Id == bookingId && b.UserId == userId.Value);
        else
            query = query.Where(b => b.Id == bookingId);

        var booking = await query
            .ProjectTo<T>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        if (booking == null) throw new KeyNotFoundException($"Booking with {bookingId} not found");

        var ticketsQuery = _context.Tickets
            .AsNoTracking()
            .Where(t => t.BookingId == bookingId)
            .OrderBy(t => t.Id);

        var totalCount = await ticketsQuery.CountAsync();
        var ticketItems = await ticketsQuery
            .ApplyPagination(filter)
            .ProjectTo<TicketBookingDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        booking.PagedTickets = new PagedResult<TicketBookingDto>
        {
            Items = ticketItems,
            TotalCount = totalCount,
            Page = filter.Page ?? 1,
            PageSize = filter.PageSize ?? 10
        };

        return booking;
    }

    public async Task<BookingDto> CreateBookingAsync(int userId, CreateBookingDto dto)
    {
        if (dto.SeatIds == null || !dto.SeatIds.Any())
            throw new ArgumentException("At least one seat must be selected.");

        var session = await _context.Sessions
                          .Include(s => s.Movie).Include(s => s.Hall)
                          .FirstOrDefaultAsync(s => s.Id == dto.SessionId)
                      ?? throw new KeyNotFoundException("Session not found.");

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
                BookingTime = DateTime.UtcNow,
                Status = BookingStatus.Inprogress
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

            await _context.Entry(booking).Reference(b => b.Session).Query().Include(s => s.Movie).LoadAsync();
            await _context.Entry(booking).Collection(b => b.Tickets).Query().Include(t => t.Seat).LoadAsync();

            return _mapper.Map<BookingDto>(booking);
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
            throw new InvalidOperationException(
                $"Запізно для скасування. До сеансу залишилося {Math.Round(minutesRemaining)} хв. (мінімум 30)");
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

    public async Task<BookingsStatsDto> GetBookingStatsAsync(BookingFilterDto filter)
    {
        var query = _context.Bookings.AsNoTracking();
        query = ApplyFilter(query, filter);
        DateTime endDate = filter.BookingToDate ?? DateTime.UtcNow;
        DateTime startDate = filter.BookingFromDate ?? endDate.AddDays(-30);
        return new BookingsStatsDto
        {
            TotalCount = await query.CountAsync(),
            InProgressCount = await query.CountAsync(b => b.Status == BookingStatus.Inprogress),
            PaidCount = await query.CountAsync(b => b.Status == BookingStatus.Paid),
            CancelledCount = await query.CountAsync(b => b.Status == BookingStatus.Cancelled),
            TotalTicketsCount = await query
                .SelectMany(b => b.Tickets)
                .Where(t => t.IsActive)
                .CountAsync(),
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