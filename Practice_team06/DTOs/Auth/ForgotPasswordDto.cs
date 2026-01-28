using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Auth;

public class ForgotPasswordDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;
}