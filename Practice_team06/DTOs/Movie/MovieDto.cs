namespace Practice_team06.DTOs.Movie;

public class MovieDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public int? DurationMin { get; set; }
    public DateOnly? ReleaseDate { get; set; }
    public decimal BasePrice { get; set; }
    public double? Rating { get; set; }
    public string? PosterUri { get; set; }
    public string AgeRestriction  { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string DirectorName { get; set; }
    public List<string> Genres { get; set; } = new();
    public List<string> Actors { get; set; } = new();
}