using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Auth;

public class RefreshTokenDto
{
    [Required]
    public string AccessToken { get; set; } = null!;

    [Required]
    public string RefreshToken { get; set; } = null!;
}