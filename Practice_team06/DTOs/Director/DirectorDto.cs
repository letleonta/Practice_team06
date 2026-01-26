using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Director;

public class DirectorDto
{
    public int Id { get; set; }
    
    public string FirstName { get; set; } = null!;
    
    public string LastName { get; set; } = null!;
    
    public string? PhotoUri { get; set; }
}