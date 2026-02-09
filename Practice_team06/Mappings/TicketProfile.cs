using AutoMapper;
using Practice_team06.DTOs.Ticket;
using Practice_team06.Models;

namespace Practice_team06.Mappings;

public class TicketProfile : Profile
{
    public TicketProfile()
    {
        CreateMap<Ticket, TicketBookingDto>()
            .ForMember(d => d.RowNumber, o => o.MapFrom(s => s.Seat.RowNumber))
            .ForMember(d => d.SeatNumber, o => o.MapFrom(s => s.Seat.SeatNumber));
        
        CreateMap<Ticket, AdminTicketDto>()
            .ForMember(d => d.UserId, o => o.MapFrom(s => s.Booking.UserId))
            .ForMember(d => d.HallName, o => o.MapFrom(s => s.Seat.Hall.Name))
            .ForMember(d => d.RowNumber, o => o.MapFrom(s => s.Seat.RowNumber))
            .ForMember(d => d.SeatNumber, o => o.MapFrom(s => s.Seat.SeatNumber));
        
        CreateMap<Ticket, TicketDto>()
            .ForMember(d => d.HallName, o => o.MapFrom(s => s.Seat.Hall.Name))
            .ForMember(d => d.RowNumber, o => o.MapFrom(s => s.Seat.RowNumber))
            .ForMember(d => d.SeatNumber, o => o.MapFrom(s => s.Seat.SeatNumber));
    }
}