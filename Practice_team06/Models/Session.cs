using System;
using System.Collections.Generic;

namespace Practice_team06.Models;

public partial class Session
{
    public int Id { get; set; }

    public int MovieId { get; set; }

    public int HallId { get; set; }

    public int LanguageId { get; set; }

    public DateTime StartTime { get; set; }

    public virtual Hall Hall { get; set; } = null!;

    public virtual Language Language { get; set; } = null!;

    public virtual Movie Movie { get; set; } = null!;

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
