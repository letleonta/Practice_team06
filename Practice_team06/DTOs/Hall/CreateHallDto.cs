using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Hall;

public class CreateHallDto
{
    [Required(ErrorMessage = "Назва залу є обов'язковою")]
    [StringLength(30, MinimumLength = 3, ErrorMessage = "Назва має бути від 3 до 30 символів")]
    public string Name { get; set; } = null!;

    [Range(0.1, 5.0, ErrorMessage = "Коефіцієнт ціни має бути від 0.1 до 5.0")]
    public decimal PriceModifier { get; set; } = 1.0m;

    [StringLength(100, ErrorMessage = "Опис занадто довгий")]
    public string? Description { get; set; }
}