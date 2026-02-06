using System.ComponentModel.DataAnnotations;
using Practice_team06.DTOs.Ticket;
using Practice_team06.Models;

namespace Practice_team06.DTOs.Booking;

public class AdminBookingDto : BookingDto
{
    [Required]
    [EmailAddress]
    public string UserEmail { get; set; } = null!;
}