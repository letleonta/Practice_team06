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
    public string Name { get; set; } = null!;
    public decimal PriceModifier { get; set; } = 1.0m;
    public string? Description { get; set; }
}

public class RowConfigDto
{
    public short RowNumber { get; set; }
    public short SeatCount { get; set; }
    public SeatType Type { get; set; } = SeatType.Standard;
}

public class GenerateStandardSeatsDto
{
    public int HallId { get; set; }
    public short RowCount { get; set; }
    public short SeatsPerRow { get; set; }
    public SeatType Type { get; set; } = SeatType.Standard;
}

public class GenerateFlexibleSeatsDto
{
    public int HallId { get; set; }
    public List<RowConfigDto> Rows { get; set; } = new();
}