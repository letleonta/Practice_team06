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
            .ForMember(dest => dest.MovieTitle, opt => opt.MapFrom(src => src.Session.Movie.Title))
            .ForMember(dest => dest.MoviePoster, opt => opt.MapFrom(src => src.Session.Movie.PosterUri))
            .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => src.Session.StartTime))
            .ForMember(dest => dest.AgeRestriction, opt => opt.MapFrom(src => src.Session.Movie.AgeRestriction))
            .ForMember(dest => dest.HallName, opt => opt.MapFrom(src => src.Session.Hall.Name))
            .ForMember(dest => dest.RowNumber, opt => opt.MapFrom(src => src.Seat.RowNumber))
            .ForMember(dest => dest.SeatNumber, opt => opt.MapFrom(src => src.Seat.SeatNumber));
    }
}