using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Auth;

public class ChangeEmailDto
{
    [Required]
    [EmailAddress]
    public string NewEmail { get; set; } = null!;

    [Required]
    public string CurrentPassword { get; set; } = null!;
}