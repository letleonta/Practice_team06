using Practice_team06.Models;

namespace Practice_team06.DTOs;

public class AdminTicketDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal ActualPrice { get; set; }
    public bool IsActive { get; set; }

    public int BookingId { get; set; }
    public int SessionId { get; set; }
    public int SeatId { get; set; }
    
    public static AdminTicketDto TicketToAdminTicketDto(Ticket ticket, int userId)
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

