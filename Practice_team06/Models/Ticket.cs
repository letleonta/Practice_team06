using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Practice_team06.Models;

public partial class Ticket
{
    public int Id { get; set; }
    [Required]
    public int BookingId { get; set; }
    [Required]
    public int SessionId { get; set; }
    [Required]
    public int SeatId { get; set; }
    [Required]
    [Range(0, 1000000)]
    public decimal ActualPrice { get; set; }
    [Required]
    public bool IsActive { get; set; }

    public virtual Booking Booking { get; set; } = null!;

    public virtual Seat Seat { get; set; } = null!;

    public virtual Session Session { get; set; } = null!;
}
