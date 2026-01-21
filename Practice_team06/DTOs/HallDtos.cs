using System.ComponentModel.DataAnnotations;
using Practice_team06.Models;

namespace Practice_team06.DTOs;

public class HallDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public decimal PriceModifier { get; set; }
    public string? Description { get; set; }
}

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


public class RowConfigDto
{
    [Range(1, 200, ErrorMessage = "Номер ряду має бути від 1 до 200")]
    public short RowNumber { get; set; }

    [Range(1, 200, ErrorMessage = "Кількість місць у ряду має бути від 1 до 200")]
    public short SeatCount { get; set; }

    [Required]
    public SeatType Type { get; set; }
}

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

public class GenerateFlexibleSeatsDto
{
    [Required]
    public int HallId { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "Потрібно вказати хоча б один ряд")]
    public List<RowConfigDto> Rows { get; set; } = new();
}