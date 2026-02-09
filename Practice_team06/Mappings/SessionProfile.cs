using AutoMapper;
using Practice_team06.DTOs.Session;
using Practice_team06.Models;

namespace Practice_team06.Mappings;

public class SessionProfile : Profile
{
    public SessionProfile()
    {
        CreateMap<Session, SessionDto>()
            .ForMember(dest => dest.MovieTitle, opt => opt.MapFrom(src => src.Movie.Title))
            .ForMember(dest => dest.HallName, opt => opt.MapFrom(src => src.Hall.Name))
            .ForMember(dest => dest.LanguageName, opt => opt.MapFrom(src => src.Language.Name))
            .ForMember(dest => dest.AgeRestriction, opt => opt.MapFrom(src => src.Movie.AgeRestriction))
            .ForMember(dest => dest.EndTime, opt => opt.MapFrom(src => 
                src.StartTime.AddMinutes(src.Movie.DurationMin ?? 0)));
    }
}