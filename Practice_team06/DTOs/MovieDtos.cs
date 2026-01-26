using System.ComponentModel.DataAnnotations;
using Practice_team06.Models;
namespace Practice_team06.DTOs;

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
    public string DirectorName { get; set; }
    public List<string> Genres { get; set; } = new();
    public List<string> Actors { get; set; } = new(); 
}
public class CreateMovieDto
{
    [Required]
    public string Title { get; set; }
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
    
    public string? PosterUri { get; set; }
    public string? TrailerUri { get; set; }
    
    public AgeRestriction AgeRestriction { get; set; }
    public int? DirectorId { get; set; }

    public List<int> GenreIds { get; set; } = new();
    public List<int> ActorIds { get; set; } = new();
}