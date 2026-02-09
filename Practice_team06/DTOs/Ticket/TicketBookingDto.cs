using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Ticket;

public class TicketBookingDto
{
    [Required]
    public int Id { get; set; }
    [Required]
    [Range(0, 1000000)]
    public decimal ActualPrice { get; set; }
    public short RowNumber { get; set; }
    public short SeatNumber { get; set; }
}