using Practice_team06.DTOs;
using Practice_team06.Models;

namespace Practice_team06.Services;

public interface ITicketService
{
    Task<List<TicketBookingDto>> GetTicketsForUserAsync(int userId, int bookingId);
    Task<TicketDto> CreateTicketAsync(int userId, int bookingId, CreateTicketDto dto);
    Task<List<AdminTicketDto>> GetAllTicketsAsync();
    Task<AdminTicketDto> GetTicketByIdAsync(int ticketId);
}