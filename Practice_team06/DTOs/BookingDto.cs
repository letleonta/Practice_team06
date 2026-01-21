using Practice_team06.Models;

namespace Practice_team06.DTOs;

public class BookingDto
{
    public int Id { get; set; }
    public DateTime? BookingTime { get; set; }
    
    public BookingStatus Status { get; set; }
}