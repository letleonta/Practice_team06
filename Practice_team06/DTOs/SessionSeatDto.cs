using System.ComponentModel.DataAnnotations;
using Practice_team06.Models;

namespace Practice_team06.DTOs;

public class SessionSeatDto
{
    [Required]
    public int SeatId { get; set; }

    [Required]
    public short RowNumber { get; set; }

    [Required]
    public short SeatNumber { get; set; }

    [Required]
    public SeatType Type { get; set; }

    [Required]
    public bool IsAvailable { get; set; } 
    
    public decimal? Price { get; set; }    
}