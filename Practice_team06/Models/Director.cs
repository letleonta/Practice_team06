using System.ComponentModel.DataAnnotations;

namespace Practice_team06.Models;

public class Director
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(50)]
    public string FirstName { get; set; } = null!;
    
    [Required]
    [StringLength(50)]
    public string LastName { get; set; } = null!;
    
    [Url]
    public string? PhotoUri { get; set; }
    
    public ICollection<Movie> Movies { get; set; } = new List<Movie>();
}