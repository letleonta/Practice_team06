using Practice_team06.DTOs.Common;
using Practice_team06.DTOs.Ticket;

namespace Practice_team06.DTOs.Booking;

public interface IBookingWithTickets
{
    PagedResult<TicketBookingDto> PagedTickets { get; set; }
}