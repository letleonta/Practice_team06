using System.ComponentModel.DataAnnotations;
using Practice_team06.Models;

namespace Practice_team06.DTOs.Hall;

public class GenerateStandardSeatsDto
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "ID залу має бути більше 0")]
    public int HallId { get; set; }

    [Required]
    [Range(1, 200, ErrorMessage = "Кількість рядів має бути від 1 до 200")]
    public short RowCount { get; set; }

    [Required]
    [Range(1, 200, ErrorMessage = "Кількість місць у ряду має бути від 1 до 200")]
    public short SeatsPerRow { get; set; }

    [Required]
    public SeatType Type { get; set; } = SeatType.Standard;
}