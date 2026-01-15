using System;
using System.Collections.Generic;

namespace Practice_team06.Models;

public partial class Booking
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public DateTime BookingTime { get; set; }

    public decimal TotalPrice { get; set; }

    public BookingStatus Status { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
public enum BookingStatus
{
    InProgress,
    Paid,
    Cancelled
}