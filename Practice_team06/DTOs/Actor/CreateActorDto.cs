using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Actor;

public class CreateActorDto
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