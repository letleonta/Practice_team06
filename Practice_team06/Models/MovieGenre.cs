using System.ComponentModel.DataAnnotations;

namespace Practice_team06.Models;

public class MovieGenre
{
    [Required]
    public int MovieId { get; set; }
    [Required]
    public int GenreId { get; set; }
    
    public virtual Genre Genre { get; set; } = null!;

    public virtual Movie Movie { get; set; } = null!;
}