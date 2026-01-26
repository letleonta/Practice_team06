using System.ComponentModel.DataAnnotations;
using Practice_team06.Models;

namespace Practice_team06.DTOs.Hall;

public class RowConfigDto
{
    [Range(1, 200, ErrorMessage = "Номер ряду має бути від 1 до 200")]
    public short RowNumber { get; set; }

    [Range(1, 200, ErrorMessage = "Кількість місць у ряду має бути від 1 до 200")]
    public short SeatCount { get; set; }

    [Required]
    public SeatType Type { get; set; }
}