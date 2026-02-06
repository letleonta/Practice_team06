using AutoMapper;
using Practice_team06.Models;
using Practice_team06.DTOs.Seat;

namespace Practice_team06.Mappings;

public class SeatProfile : Profile
{
    public SeatProfile()
    {
        CreateMap<Seat, SeatDto>();
        CreateMap<UpdateSeatDto, Seat>();
        
        CreateMap<Seat, SessionSeatDto>()
            .ForMember(d => d.SeatId, o => o.MapFrom(s => s.Id))
            .ForMember(d => d.Type, o => o.MapFrom(s => s.SeatType))
            .ForMember(d => d.IsAvailable, o => o.Ignore()) // Розраховується в сервісі
            .ForMember(d => d.Price, o => o.Ignore());      // Розраховується в сервісі
    }
}