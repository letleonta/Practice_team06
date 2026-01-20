using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Practice_team06.Models;

public partial class MovieActor
{
    [Required]
    public int MovieId { get; set; }
    [Required]
    public int ActorId { get; set; }
    [StringLength(100)]
    public string? RoleName { get; set; }

    public virtual Actor Actor { get; set; } = null!;

    public virtual Movie Movie { get; set; } = null!;
}
