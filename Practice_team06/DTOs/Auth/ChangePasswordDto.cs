using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Auth;

public class ChangePasswordDto
{
    [Required] 
    public string OldPassword { get; set; } = null!;
    [Required] 
    [MinLength(6)] 
    public string NewPassword { get; set; } = null!;
}
