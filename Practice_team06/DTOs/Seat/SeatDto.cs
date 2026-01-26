using System.ComponentModel.DataAnnotations;
using Practice_team06.Models;

namespace Practice_team06.DTOs.Seat;

public class SeatDto
{
    public int Id { get; set; }
    
    public int HallId { get; set; }

    [Required] 
    public short RowNumber { get; set; }

    [Required] 
    public short SeatNumber { get; set; }
    
    public decimal PriceModifier { get; set; }
    
    public SeatType SeatType { get; set; }
}