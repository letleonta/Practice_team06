using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Director;

public class CreateDirectorDto
{
    [Required]
    [StringLength(50)]
    public string FirstName { get; set; } = null!;

    [Required]
    [StringLength(50)]
    public string LastName { get; set; } = null!;

    [Url]
    public string? PhotoUri { get; set; }
}