using System;
using System.Collections.Generic;

namespace Practice_team06.Models;

public partial class Actor
{
    public int Id { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string? PhotoUrl { get; set; }

    public virtual ICollection<MovieActor> MovieActors { get; set; } = new List<MovieActor>();
}
