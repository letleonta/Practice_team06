using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs;

public class DirectorDto
{
    public int Id { get; set; }
    
    public string FirstName { get; set; } = null!;
    
    public string LastName { get; set; } = null!;
    
    public string? PhotoUri { get; set; }
}

public class CreateDirectorDto
{
    [Required]
    [StringLength(50)]
    public string FirstName { get; set; } = null!;

    [Required]
    [StringLength(50)]
    public string LastName { get; set; } = null!;

    [Url]
    public string? PhotoUri { get; set; }
}