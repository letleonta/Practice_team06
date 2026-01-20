using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Practice_team06.Models;

public partial class Seat
{
    public int Id { get; set; }
    [Required]
    public int HallId { get; set; }
    [Required]
    [Range(1, 200)]
    public short RowNumber { get; set; }
    [Required]
    [Range(1, 200)]
    public short SeatNumber { get; set; }
    [Range(0.1, 5.0)]
    public decimal? PriceModifier { get; set; }
    
    public SeatType SeatType { get; set; }
    
    public SeatStatus SeatStatus { get; set; }

    public virtual Hall Hall { get; set; } = null!;

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
public enum SeatType { Standard, VIP }

public enum SeatStatus { Free, Reserved, Sold }