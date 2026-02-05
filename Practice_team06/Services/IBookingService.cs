using Practice_team06.DTOs;
using Practice_team06.DTOs.Booking;
using Practice_team06.DTOs.Booking.Stats;
using Practice_team06.DTOs.Common;
using Practice_team06.Models;

namespace Practice_team06.Services;

public interface IBookingService
{
    Task<AdminBookingsWithStatsDto> GetAllBookingsAsync(BookingFilterDto filter);
    Task<PagedResult<BookingDto>> GetBookingsForUserAsync(int userId, BookingFilterDto filter);
    Task<BookingDto> GetBookingByIdAsync(int userId, int bookingId);
    Task<AdminBookingDto> GetBookingByIdAsync(int bookingId);
    Task<BookingDto> CreateBookingAsync(int userId, CreateBookingDto dto);
    Task ConfirmBookingAsync(int userId, int bookingId);
    Task CancelBookingAsync(int userId, int bookingId);
    Task DeleteBookingAsync(int bookingId);
}