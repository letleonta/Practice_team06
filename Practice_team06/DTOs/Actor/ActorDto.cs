using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Actor;

public class ActorDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string? PhotoUri { get; set; }
}