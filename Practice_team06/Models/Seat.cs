using System;
using System.Collections.Generic;

namespace Practice_team06.Models;

public partial class Seat
{
    public int Id { get; set; }

    public int HallId { get; set; }

    public short RowNumber { get; set; }

    public short SeatNumber { get; set; }

    public decimal? PriceModifier { get; set; }
    
    public SeatType SeatType { get; set; }
    
    public SeatStatus SeatStatus { get; set; }

    public virtual Hall Hall { get; set; } = null!;

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
public enum SeatType { Standard, VIP }

public enum SeatStatus { Free, Reserved, Sold }