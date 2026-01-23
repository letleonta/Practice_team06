using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs;

public class SessionDto
{
    public int Id { get; set; }
    public string MovieTitle { get; set; }
    public int HallId { get; set; }
    public string HallName { get; set; }
    public string LanguageName { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; } 
}

public class CreateSessionDto
{
    [Required]
    public int MovieId { get; set; }
    [Required]
    public int HallId { get; set; }
    [Required]
    public int LanguageId { get; set; }
    [Required]
    public DateTime StartTime { get; set; }
}