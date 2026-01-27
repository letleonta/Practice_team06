using System.ComponentModel.DataAnnotations;

namespace Practice_team06.Models;

public partial class Genre
{
    public int Id { get; set; }
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = null!;

    public virtual ICollection<MovieGenre> MovieGenres { get; set; } = new List<MovieGenre>();
}
