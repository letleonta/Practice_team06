using System.ComponentModel.DataAnnotations;
using Practice_team06.Models;
namespace Practice_team06.DTOs.Movie;

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