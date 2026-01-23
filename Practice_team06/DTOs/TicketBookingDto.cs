using System.ComponentModel.DataAnnotations;
using Practice_team06.Models;

namespace Practice_team06.DTOs;

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

    public bool IsActive { get; set; } = true;

    public static TicketBookingDto TicketToTicketBookingDto(Ticket ticket)
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