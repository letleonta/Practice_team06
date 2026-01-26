namespace Practice_team06.DTOs;

public class ActorMovieDto
{
    public int MovieId { get; set; }
    public string Title { get; set; } = null!;
    public string? RoleName { get; set; }
    public DateOnly? ReleaseDate { get; set; }
}