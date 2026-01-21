using Practice_team06.Models;

namespace Practice_team06.DTOs;

public class SessionSeatDto
{
    public int SeatId { get; set; }
    public short RowNumber { get; set; }
    public short SeatNumber { get; set; }
    public SeatType Type { get; set; }
    public bool IsAvailable { get; set; } 
    public decimal? Price { get; set; }    
}