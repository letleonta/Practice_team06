using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Practice_team06.Models;

public partial class Actor
{
    public int Id { get; set; }
    [Required]
    [StringLength(50)]
    public string FirstName { get; set; } = null!;
    [Required]
    [StringLength(50)]
    public string LastName { get; set; } = null!;
    [Url]
    public string? PhotoUri { get; set; }

    public virtual ICollection<MovieActor> MovieActors { get; set; } = new List<MovieActor>();
}
