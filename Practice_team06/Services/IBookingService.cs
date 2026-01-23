using Practice_team06.DTOs;
using Practice_team06.Models;

namespace Practice_team06.Services;

public interface IBookingService
{
    Task<List<AdminBookingDto>> GetAllBookingsAsync(BookingFilterDto filter);
    Task<List<BookingDto>> GetBookingsForUserAsync(int userId);
    Task<Booking> CreateBookingAsync(int userId);
    Task<AdminBookingDto> GetBookingByIdAsync(int bookingId);
    Task<BookingDto> GetBookingByIdAsync(int userId, int bookingId);
    Task ConfirmBookingAsync(int userId, int bookingId);
    Task CancelBookingAsync(int userId, int bookingId);
    Task ChangeBookingStatusAsync(int userId, int bookingId, BookingStatus newStatus);

    Task DeleteBookingAsync(int bookingId);
}
