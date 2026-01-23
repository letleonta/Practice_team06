using System.ComponentModel.DataAnnotations;
using Practice_team06.Models;

namespace Practice_team06.DTOs;

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

public class UpdateSeatDto
{
    public SeatType SeatType { get; set; }
    
    [Range(0.1, 5.0, ErrorMessage = "Коефіцієнт ціни має бути від 0.1 до 5.0")]
    public decimal PriceModifier { get; set; }
}