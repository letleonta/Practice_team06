using Practice_team06.DTOs.Common;
using Practice_team06.DTOs.Ticket;

namespace Practice_team06.Services;

public interface ITicketService
{
    Task<PagedResult<AdminTicketDto>> GetAllTicketsAsync(BaseFilterDto filter);
    Task<AdminTicketDto> GetTicketByIdAsync(int ticketId);
    Task<TicketDto> GetTicketForUserByIdAsync(int userId, int ticketId);
    Task RefundTicketByUserAsync(int userId, int ticketId);
    Task RefundTicketByAdminAsync(int ticketId);
    Task DeleteTicketAsync(int ticketId);
}