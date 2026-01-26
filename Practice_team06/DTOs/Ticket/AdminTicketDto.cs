using System.ComponentModel.DataAnnotations;

namespace Practice_team06.DTOs.Ticket;

public class AdminTicketDto
{
    public int Id { get; set; }
    [Required]
    public int UserId { get; set; }
    [Required]
    public int BookingId { get; set; }
    [Required]
    public int SessionId { get; set; }
    [Required]
    public int SeatId { get; set; }
    [Required]
    [Range(0, 10000)]
    public decimal ActualPrice { get; set; }
    [Required]
    public bool IsActive { get; set; }
    
    public static AdminTicketDto TicketToAdminTicketDto(Models.Ticket ticket, int userId)
    {
        return new AdminTicketDto
        {
            Id = ticket.Id,
            BookingId = ticket.BookingId,
            UserId = userId,
            ActualPrice = ticket.ActualPrice,
            IsActive = ticket.IsActive,
            SessionId = ticket.SessionId,
            SeatId = ticket.SeatId
        };
    }
}

