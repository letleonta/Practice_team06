using System.ComponentModel.DataAnnotations;
using Practice_team06.DTOs.Ticket;
using Practice_team06.Models;

namespace Practice_team06.DTOs.Booking;

public class AdminBookingDto
{
    public int Id { get; set; }
    [Required]
    public int UserId { get; set; }
    [Required(ErrorMessage = "Назва фільму обов'язкова")]
    [StringLength(255)]
    public string Title { get; set; } = null!;
    [Required(ErrorMessage = "Вкажіть час")]
    public DateTime StartTime { get; set; }
    [Required]
    [DataType(DataType.DateTime)]
    public DateTime BookingTime { get; set; }
    public AgeRestriction AgeRestriction { get; set; }
    [Url(ErrorMessage = "Некоректне посилання")]
    public string? PosterUri { get; set; }
    [Required]
    public BookingStatus Status { get; set; }
    
    public virtual ICollection<TicketBookingDto> Tickets { get; set; } = new List<TicketBookingDto>();
    
    public decimal TotalPrice { get; set; }
}