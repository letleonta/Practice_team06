using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Auth;

public class ResetPasswordDto
{
    [Required]
    public string Token { get; set; } = null!; // Токен з email-посилання

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = null!;

    [Required]
    [Compare("NewPassword", ErrorMessage = "Паролі не співпадають")]
    public string ConfirmNewPassword { get; set; } = null!;
}