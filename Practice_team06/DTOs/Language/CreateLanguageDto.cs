using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Language;

public class CreateLanguageDto
{
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = null!;
}