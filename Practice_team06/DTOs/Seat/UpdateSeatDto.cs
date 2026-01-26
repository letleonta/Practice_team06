using System.ComponentModel.DataAnnotations;
using Practice_team06.Models;

namespace Practice_team06.DTOs.Seat;

public class UpdateSeatDto
{
    public SeatType SeatType { get; set; }
    
    [Range(0.1, 5.0, ErrorMessage = "Коефіцієнт ціни має бути від 0.1 до 5.0")]
    public decimal PriceModifier { get; set; }
}