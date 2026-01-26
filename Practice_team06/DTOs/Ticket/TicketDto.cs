using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Ticket;

public class TicketDto
{
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
    public bool IsActive { get; set; } = true;

    public static TicketDto TicketToTicketDto(Models.Ticket ticket)
    {
        return new TicketDto
        {
            BookingId = ticket.BookingId,
            SessionId = ticket.SessionId,
            SeatId = ticket.SeatId,
            ActualPrice = ticket.ActualPrice,
            IsActive = ticket.IsActive
        };
    }
}