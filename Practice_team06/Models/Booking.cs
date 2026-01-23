using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Practice_team06.Models;

public partial class Booking
{
    public int Id { get; set; }
    [Required]
    public int UserId { get; set; }

    public DateTime BookingTime { get; set; }
    
    public BookingStatus Status { get; set; }

    public virtual User User { get; set; } = null!;

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
public enum BookingStatus { Inprogress, Paid, Cancelled }