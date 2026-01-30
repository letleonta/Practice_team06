using System.ComponentModel.DataAnnotations;
using Practice_team06.DTOs.Ticket;
using Practice_team06.Models;

namespace Practice_team06.DTOs.Booking;

public class BookingDto
{
    public int Id { get; set; }
    [Required]
    public int SessionId { get; set; }
    [Required]
    [DataType(DataType.DateTime)]
    public DateTime BookingTime { get; set; }
    [Required]
    public BookingStatus Status { get; set; }
    
    public virtual ICollection<TicketBookingDto> Tickets { get; set; } = new List<TicketBookingDto>();
    
    public decimal TotalPrice { get; set; }
}