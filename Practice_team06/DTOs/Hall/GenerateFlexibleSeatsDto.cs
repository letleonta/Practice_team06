using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Hall;

public class GenerateFlexibleSeatsDto
{
    [Required]
    public int HallId { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "Потрібно вказати хоча б один ряд")]
    public List<RowConfigDto> Rows { get; set; } = new();
}