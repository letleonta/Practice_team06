using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using Practice_team06.Attributes;

namespace Practice_team06.Models;

public class User : IdentityUser<int>
{
    [Required(ErrorMessage = "Ім'я є обов'язковим")]
    [StringLength(50, MinimumLength = 2)]
    [RegularExpression(@"^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s'-]+$", ErrorMessage = "Ім'я може містити лише літери")]
    public string FirstName { get; set; } = null!;
    
    [Required(ErrorMessage = "Прізвище є обов'язковим")]
    [StringLength(50, MinimumLength = 2)]
    [RegularExpression(@"^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s'-]+$", ErrorMessage = "Прізвище може містити лише літери")]
    public string LastName { get; set; } = null!;
    
    [Required]
    [DataType(DataType.Date)]
    [PastDate(ErrorMessage = "Дата народження не може бути у майбутньому")] 
    public DateTime? BirthDate { get; set; }
    
    [StringLength(255, MinimumLength = 2)]
    public string? AvatarUri { get; set; } 
    
    public List<Booking> Bookings { get; set; } = new();
}