using System.ComponentModel.DataAnnotations;
using Practice_team06.Attributes;

namespace Practice_team06.DTOs.Auth;

public class RegisterDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;
    
    [Required] 
    [MinLength(6)] 
    public string Password { get; set; } = null!;
    
    [Required(ErrorMessage = "Ім'я є обов'язковим")]
    [StringLength(50, MinimumLength = 2)]
    [RegularExpression(@"^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s'-]+$", ErrorMessage = "Ім'я може містити лише літери")]
    public string FirstName { get; set; } = null!;

    [Required(ErrorMessage = "Прізвище є обов'язковим")]
    [StringLength(50, MinimumLength = 2)]
    [RegularExpression(@"^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s'-]+$", ErrorMessage = "Прізвище може містити лише літери")]
    public string LastName { get; set; } = null!;
    
    [Required]
    [PastDate(ErrorMessage = "Дата народження не може бути у майбутньому")]
    public DateTime BirthDate { get; set; }
}