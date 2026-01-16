using System;
using System.Collections.Generic;

namespace Practice_team06.Models;

public partial class Hall
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public decimal PriceModifier { get; set; }

    public string? Description { get; set; }

    public virtual ICollection<Seat> Seats { get; set; } = new List<Seat>();

    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();
}
