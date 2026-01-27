using System.ComponentModel.DataAnnotations;

namespace Practice_team06.Models;

public partial class Hall
{
    public int Id { get; set; }
    [Required]
    [StringLength(30)]
    public string Name { get; set; } = null!;
    [Range(0.1, 5.0)]
    public decimal PriceModifier { get; set; }
    [StringLength(100)]
    public string? Description { get; set; }

    public virtual ICollection<Seat> Seats { get; set; } = new List<Seat>();

    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();
}
