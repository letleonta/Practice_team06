using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Practice_team06.Models;

public partial class Session
{
    public int Id { get; set; }
    [Required(ErrorMessage = "Оберіть фільм")]
    public int MovieId { get; set; }
    [Required(ErrorMessage = "Оберіть зал")]
    public int HallId { get; set; }
    [Required(ErrorMessage = "Оберіть мову")]
    public int LanguageId { get; set; }
    [Required(ErrorMessage = "Вкажіть час")]
    public DateTime StartTime { get; set; }

    public virtual Hall Hall { get; set; } = null!;

    public virtual Language Language { get; set; } = null!;

    public virtual Movie Movie { get; set; } = null!;

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
