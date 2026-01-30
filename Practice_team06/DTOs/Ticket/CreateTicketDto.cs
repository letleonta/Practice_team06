using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Ticket;

public class CreateTicketDto
{
    [Required]
    public int SeatId { get; set; }
}