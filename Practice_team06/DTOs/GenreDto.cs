using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs;

public class GenreDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
}

public class CreateGenreDto
{
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = null!;
}