using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Booking.Stats;

public class AdminBookingsWithStatsDto
{
    [Required]
    public PagedResult<AdminBookingDto> BookingsPage { get; set; }
    [Required]
    public BookingsStatsDto Stats { get; set; }
}