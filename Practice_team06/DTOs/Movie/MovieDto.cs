using Practice_team06.DTOs.Actor;
using Practice_team06.DTOs.Director;
using Practice_team06.DTOs.Genre;

namespace Practice_team06.DTOs.Movie;

public class MovieDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int? DurationMin { get; set; }
    public DateOnly? ReleaseDate { get; set; }
    public decimal BasePrice { get; set; }
    public double? Rating { get; set; }
    public string? PosterUri { get; set; }
    public string? TrailerUri { get; set; }
    public string AgeRestriction  { get; set; } = null!;
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public DirectorDto? Director { get; set; }
    public List<ActorDto> Actors { get; set; } = new();
    public List<GenreDto> Genres { get; set; } = new();
}