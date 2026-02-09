using System.ComponentModel.DataAnnotations;
using Practice_team06.Models;

namespace Practice_team06.DTOs.Booking;

public class BookingDto
{
    public int Id { get; set; }
    [StringLength(255)]
    public string Title { get; set; } = null!;
    public DateTime StartTime { get; set; }
    public DateTime BookingTime { get; set; }
    public AgeRestriction AgeRestriction { get; set; }
    [Url(ErrorMessage = "Некоректне посилання")]
    public string? PosterUri { get; set; }
    public BookingStatus Status { get; set; }
    public int TicketsCount { get; set; }
    public decimal TotalPrice { get; set; }
}