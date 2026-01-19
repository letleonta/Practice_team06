using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Practice_team06.Models;

public partial class Language
{
    public int Id { get; set; }
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = null!;

    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();
}
