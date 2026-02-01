using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Ticket;

public class TicketDto
{
    [Required]
    public int BookingId { get; set; }
    [Required]
    public int SessionId { get; set; }
    [Required]
    [Range(0, 1000000)]
    public decimal ActualPrice { get; set; }
    [Required]
    public bool IsActive { get; set; } = true;
    public string? HallName { get; set; } = null!;
    public short? RowNumber { get; set; }
    public short? SeatNumber { get; set; }

    public static TicketDto TicketToTicketDto(Models.Ticket ticket)
    {
        return new TicketDto
        {
            BookingId = ticket.BookingId,
            SessionId = ticket.SessionId,
            ActualPrice = ticket.ActualPrice,
            IsActive = ticket.IsActive,
            HallName = ticket.Seat.Hall.Name,
            RowNumber = ticket.Seat.RowNumber,
            SeatNumber = ticket.Seat.SeatNumber
        };
    }
}