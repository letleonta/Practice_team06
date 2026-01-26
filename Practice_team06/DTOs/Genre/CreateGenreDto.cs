using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Genre;

public class CreateGenreDto
{
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = null!;
}