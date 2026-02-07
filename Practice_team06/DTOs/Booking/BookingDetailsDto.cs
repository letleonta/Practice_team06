using Practice_team06.DTOs.Common;
using Practice_team06.DTOs.Ticket;

namespace Practice_team06.DTOs.Booking;

public class BookingDetailsDto : BookingDto, IBookingWithTickets
{
    public PagedResult<TicketBookingDto> PagedTickets { get; set; } = null!;
}