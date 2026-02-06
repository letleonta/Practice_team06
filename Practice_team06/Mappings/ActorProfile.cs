using AutoMapper;
using Practice_team06.DTOs.Actor;
using Practice_team06.Models;

namespace Practice_team06.Mappings;

public class ActorProfile : Profile
{
    public ActorProfile()
    {
        CreateMap<Actor, ActorDto>();

        CreateMap<CreateActorDto, Actor>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());

        CreateMap<MovieActor, ActorMovieDto>()
            .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Movie.Title))
    
            .ForMember(dest => dest.ReleaseDate, opt => opt.MapFrom(src => src.Movie.ReleaseDate))
            
            .ForMember(dest => dest.MovieId, opt => opt.MapFrom(src => src.MovieId))
            .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.RoleName));
    }
}