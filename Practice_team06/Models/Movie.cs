using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using NpgsqlTypes;

namespace Practice_team06.Models;

public partial class Movie
{
    public int Id { get; set; }
    [Required(ErrorMessage = "Назва фільму обов'язкова")]
    [StringLength(255)]
    public string Title { get; set; } = null!;

    public string? Description { get; set; }
    [Range(1, 600, ErrorMessage = "Тривалість від 1 до 600 хв")]
    public int? DurationMin { get; set; }
    [DataType(DataType.Date)]
    public DateOnly? ReleaseDate { get; set; }
    [Required]
    [Range(0, 10000)]
    public decimal BasePrice { get; set; }
    
    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }
    [Range(0, 10)]
    public decimal? Rating { get; set; }
    [Url(ErrorMessage = "Некоректне посилання")]
    public string? PosterUri { get; set; }
    [Url(ErrorMessage = "Некоректне посилання")]
    public string? TrailerUri { get; set; }
    
    public AgeRestriction AgeRestriction { get; set; }
    
    public int? DirectorId { get; set; }
    
    public virtual ICollection<MovieActor> MovieActors { get; set; } = new List<MovieActor>();

    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();

    public virtual ICollection<Genre> Genres { get; set; } = new List<Genre>();
    
    public virtual Director? Director { get; set; }  
}
public enum AgeRestriction { 
    [PgName("0+")] ZeroPlus, 
    [PgName("12+")] TwelvePlus, 
    [PgName("16+")] SixteenPlus, 
    [PgName("18+")] EighteenPlus 
}
