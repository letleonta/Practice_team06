using Practice_team06.DTOs.Ticket;

namespace Practice_team06.Services;

public interface ITicketService
{
    Task<decimal> CalculatePriceAsync(int sessionId, int seatId);
    Task<List<AdminTicketDto>> GetTicketsForBookingAsync(int bookingId);
    Task<List<TicketBookingDto>> GetTicketsForUserBookingAsync(int userId, int bookingId);
    Task<List<AdminTicketDto>> GetAllTicketsAsync();
    Task<AdminTicketDto> GetTicketByIdAsync(int ticketId);
    Task<TicketDto> GetTicketForUserByIdAsync(int userId, int ticketId);
    Task DeleteTicketAsync(int ticketId);
}