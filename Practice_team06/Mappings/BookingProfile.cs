using AutoMapper;
using Practice_team06.DTOs.Booking;
using Practice_team06.DTOs.Ticket;
using Practice_team06.Models;

namespace Practice_team06.Mappings;

public class BookingProfile : Profile
{
    public BookingProfile()
    {
        CreateMap<Ticket, TicketBookingDto>()
            .ForMember(d => d.RowNumber, o => o.MapFrom(s => s.Seat.RowNumber))
            .ForMember(d => d.SeatNumber, o => o.MapFrom(s => s.Seat.SeatNumber));

        CreateMap<Booking, BookingDto>()
            .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Session.Movie.Title))
            .ForMember(dest => dest.AgeRestriction, opt => opt.MapFrom(src => src.Session.Movie.AgeRestriction))
            .ForMember(dest => dest.PosterUri, opt => opt.MapFrom(src => src.Session.Movie.PosterUri))
            .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => src.Session.StartTime))
            .ForMember(dest => dest.TotalPrice, opt => opt.MapFrom(src => 
                src.Tickets.Where(t => t.IsActive).Sum(t => t.ActualPrice)))
            .ForMember(dest => dest.TicketsCount, opt => opt.MapFrom(src => src.Tickets.Count(t => t.IsActive)));
        
        CreateMap<Booking, BookingDetailsDto>()
            .IncludeBase<Booking, BookingDto>()
            .ForMember(dest => dest.PagedTickets, opt => opt.Ignore());

        CreateMap<Booking, AdminBookingDto>()
            .IncludeBase<Booking, BookingDto>()
            .ForMember(dest => dest.UserEmail, opt => opt.MapFrom(src => 
                src.User.Email ?? "Не вказано"));
        
        CreateMap<Booking, AdminBookingDetailsDto>()
            .IncludeBase<Booking, BookingDetailsDto>()
            .ForMember(dest => dest.UserEmail, opt => opt.MapFrom(src => 
                src.User.Email ?? "Не вказано"));
    }
}