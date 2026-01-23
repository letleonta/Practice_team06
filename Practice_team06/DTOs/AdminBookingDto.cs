using Practice_team06.Models;

namespace Practice_team06.DTOs;

public class AdminBookingDto
{
    public int Id { get; set; }
    
    public int UserId { get; set; }
    
    public DateTime? BookingTime { get; set; }
    
    public BookingStatus Status { get; set; }
    
    public virtual ICollection<TicketBookingDto> Tickets { get; set; } = new List<TicketBookingDto>();
}