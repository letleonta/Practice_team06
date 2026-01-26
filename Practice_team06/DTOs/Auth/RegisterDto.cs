using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Auth;

public class RegisterDto
{
    [Required] [EmailAddress] public string Email { get; set; } = null!;
    [Required] [MinLength(6)] public string Password { get; set; } = null!;
    
    [Required(ErrorMessage = "Ім'я є обов'язковим")]
    [StringLength(50, MinimumLength = 2)]
    public string FirstName { get; set; } = null!;
    [Required(ErrorMessage = "Прізвище є обов'язковим")]
    [StringLength(50, MinimumLength = 2)]
    public string LastName { get; set; } = null!;
    [Required]
    [DataType(DataType.Date)]
    public DateTime? BirthDate { get; set; }

}