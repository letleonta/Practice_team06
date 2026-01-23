using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs;

public class LanguageDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
}

public class CreateLanguageDto
{
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = null!;
}