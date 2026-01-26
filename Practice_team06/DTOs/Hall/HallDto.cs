using System.ComponentModel.DataAnnotations;
using Practice_team06.Models;

namespace Practice_team06.DTOs.Hall;

public class HallDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public decimal PriceModifier { get; set; }
    public string? Description { get; set; }
}