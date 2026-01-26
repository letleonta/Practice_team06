using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Ticket;

public class TicketBookingDto
{
    [Required]
    public int Id { get; set; }
    [Required]
    public int SessionId { get; set; }
    [Required]
    public int SeatId { get; set; }
    [Required]
    [Range(0, 1000000)]
    public decimal ActualPrice { get; set; }
    [Required]
    public bool IsActive { get; set; } = true;

    public static TicketBookingDto TicketToTicketBookingDto(Models.Ticket ticket)
    {
        return new TicketBookingDto()
        {
            Id = ticket.Id,
            SessionId = ticket.SessionId,
            SeatId = ticket.SeatId,
            ActualPrice = ticket.ActualPrice,
            IsActive = ticket.IsActive,
        };
    }
}