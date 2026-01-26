using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace Practice_team06.Models;

public class User : IdentityUser<int>
{
    [Required(ErrorMessage = "Ім'я є обов'язковим")]
    [StringLength(50, MinimumLength = 2)]
    public string FirstName { get; set; } = null!;
    [Required(ErrorMessage = "Прізвище є обов'язковим")]
    [StringLength(50, MinimumLength = 2)]
    public string LastName { get; set; } = null!;
    [Required]
    [DataType(DataType.Date)]
    public DateTime? BirthDate { get; set; }
    
    public List<Booking> Bookings { get; set; } = new();
}