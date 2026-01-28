using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Auth;

public class ChangePasswordDto
{
    [Required]
    public string OldPassword { get; set; } = null!; // Перевіряємо, чи це власник акаунту

    [Required]
    [MinLength(6, ErrorMessage = "Пароль має містити мінімум 6 символів")]
    public string NewPassword { get; set; } = null!;

    [Required]
    [Compare("NewPassword", ErrorMessage = "Паролі не співпадають")]
    public string ConfirmNewPassword { get; set; } = null!;
}
