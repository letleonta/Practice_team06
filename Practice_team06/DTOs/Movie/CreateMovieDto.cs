using System.ComponentModel.DataAnnotations;
using Practice_team06.Models;

namespace Practice_team06.DTOs.Movie;

public class CreateMovieActorDto
{
    public int ActorId { get; set; }
    public string RoleName { get; set; } = string.Empty;
}

public class CreateMovieDto
{
    [Required]
    public string Title { get; set; } = string.Empty;
    [Required]
    public string? Description { get; set; }
    [Range(1, 600)]
    public int DurationMin { get; set; }
    [Required]
    public DateOnly? ReleaseDate { get; set; }
    [Required]
    public decimal BasePrice { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public decimal? Rating { get; set; }
    public string? PosterUri { get; set; }
    public string? TrailerUri { get; set; }
    public AgeRestriction AgeRestriction { get; set; }
    public int? DirectorId { get; set; }
    public List<int> GenreIds { get; set; } = new();
    public List<CreateMovieActorDto> MovieActors { get; set; } = new();
}