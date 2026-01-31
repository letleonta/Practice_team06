using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Booking;

public class CreateBookingDto
{
    [Required]
    public int SessionId { get; set; }
    [Required]
    public List<int> SeatIds { get; set; }
}
