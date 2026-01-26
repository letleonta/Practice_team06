using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Session;

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