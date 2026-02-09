using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Booking;

public class AdminBookingDto : BookingDto
{
    [Required]
    [EmailAddress]
    public string UserEmail { get; set; } = null!;
}