using System;
using System.Collections.Generic;

namespace Practice_team06.Models;

public partial class Ticket
{
    public int Id { get; set; }

    public int BookingId { get; set; }

    public int SessionId { get; set; }

    public int SeatId { get; set; }

    public decimal ActualPrice { get; set; }

    public bool? IsActive { get; set; }

    public virtual Booking Booking { get; set; } = null!;

    public virtual Seat Seat { get; set; } = null!;

    public virtual Session Session { get; set; } = null!;
}
