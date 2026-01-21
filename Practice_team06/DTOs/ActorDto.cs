namespace Practice_team06.DTOs;

public class ActorDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string? PhotoUri { get; set; }
}