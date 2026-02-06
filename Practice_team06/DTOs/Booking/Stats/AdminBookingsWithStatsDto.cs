using System.ComponentModel.DataAnnotations;
using Practice_team06.DTOs.Common;

namespace Practice_team06.DTOs.Booking.Stats;

public class AdminBookingsWithStatsDto
{
    [Required]
    public PagedResult<AdminBookingDto> BookingsPage { get; set; } = null!;

    [Required]
    public BookingsStatsDto Stats { get; set; } = null!;
}