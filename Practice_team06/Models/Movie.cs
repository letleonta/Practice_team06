using System;
using System.Collections.Generic;

namespace Practice_team06.Models;

public partial class Movie
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string Description { get; set; } = null!;

    public int DurationMin { get; set; }

    public decimal BasePrice { get; set; }

    public DateOnly ReleaseDate { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public AgeRestriction AgeRestriction { get; set; }

    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();

    public virtual ICollection<Genre> Genres { get; set; } = new List<Genre>();
}
public enum AgeRestriction
{
    All = 0,      // 0+
    Twelve = 12,  // 12+
    Sixteen = 16, // 16+
    Eighteen = 18 // 18+
}