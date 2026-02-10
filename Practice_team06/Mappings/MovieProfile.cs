using AutoMapper;
using Practice_team06.Models;
using Practice_team06.DTOs.Movie;
using Practice_team06.DTOs.Actor;
using Practice_team06.DTOs.Director;
using Practice_team06.DTOs.Genre;

namespace Practice_team06.Mappings;

public class MovieProfile : Profile
{
    public MovieProfile()
    {
        CreateMap<MovieActor, MovieActorDto>()
            .ForMember(dest => dest.ActorId, opt => opt.MapFrom(src => src.ActorId))
            .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.RoleName))
            .ForMember(dest => dest.Actor, opt => opt.MapFrom(src => src.Actor));
        
        CreateMap<Movie, MovieDto>()
            .ForMember(dest => dest.AgeRestriction, 
                opt => opt.MapFrom(src => src.AgeRestriction.ToString()))
            .ForMember(dest => dest.Rating, 
                opt => opt.MapFrom(src => src.Rating.HasValue ? (double)src.Rating.Value : 0.0))
            .ForMember(dest => dest.Genres, 
                opt => opt.MapFrom(src => src.MovieGenres.Select(mg => mg.Genre)))
            .ForMember(dest => dest.MovieActors, 
                opt => opt.MapFrom(src => src.MovieActors))
            .ForMember(dest => dest.Actors, 
                opt => opt.MapFrom(src => src.MovieActors.Select(ma => ma.Actor)))
            .ForMember(dest => dest.Director, opt => opt.MapFrom(src => src.Director));
        
        CreateMap<Director, DirectorDto>();
        CreateMap<Actor, ActorDto>();
        CreateMap<Genre, GenreDto>();
    }
}