namespace Practice_team06.DTOs.Director;

public class DirectorMovieDto
{
    public int MovieId { get; set; }
    public string Title { get; set; } = null!;
    public DateOnly? ReleaseDate { get; set; }
}