using Practice_team06.DTOs;
using Practice_team06.DTOs.Booking;
using Practice_team06.DTOs.Booking.Stats;
using Practice_team06.DTOs.Common;
using Practice_team06.Models;

namespace Practice_team06.Services;

public interface IBookingService
{
    Task<PagedResult<AdminBookingDto>> GetAllBookingsAsync(BookingFilterDto filter);
    Task<PagedResult<BookingDto>> GetBookingsForUserAsync(int userId, BookingFilterDto filter);
    Task<T> GetBookingByIdAsync<T>(int? userId, int bookingId, BaseFilterDto filter) 
        where T : class, IBookingWithTickets;
    Task<BookingDto> CreateBookingAsync(int userId, CreateBookingDto dto);
    Task ConfirmBookingAsync(int userId, int bookingId);
    Task CancelBookingAsync(int userId, int bookingId);
    Task DeleteBookingAsync(int bookingId);
    Task<BookingsStatsDto> GetBookingStatsAsync(BookingFilterDto filter);
}