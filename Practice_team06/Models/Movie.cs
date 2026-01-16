using System;
using System.Collections.Generic;
using NpgsqlTypes;

namespace Practice_team06.Models;

public partial class Movie
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public int? DurationMin { get; set; }

    public DateOnly? ReleaseDate { get; set; }

    public decimal BasePrice { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public decimal? Rating { get; set; }

    public string? PosterUrl { get; set; }

    public string? TrailerUrl { get; set; }
    
    public AgeRestriction AgeRestriction { get; set; }
    
    public virtual ICollection<MovieActor> MovieActors { get; set; } = new List<MovieActor>();

    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();

    public virtual ICollection<Genre> Genres { get; set; } = new List<Genre>();
}
public enum AgeRestriction { 
    [PgName("0+")] ZeroPlus, 
    [PgName("12+")] TwelvePlus, 
    [PgName("16+")] SixteenPlus, 
    [PgName("18+")] EighteenPlus 
}
