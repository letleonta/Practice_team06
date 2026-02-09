using AutoMapper;
using Practice_team06.DTOs.Movie;
using Practice_team06.Models;

namespace Practice_team06.Mappings;

public class MovieProfile : Profile
{
    public MovieProfile()
    {
        CreateMap<Movie, MovieDto>()
            .ForMember(dest => dest.DirectorName, opt => opt.MapFrom(src => 
                src.Director != null ? $"{src.Director.FirstName} {src.Director.LastName}" : "Unknown"))
            .ForMember(dest => dest.AgeRestriction, opt => opt.MapFrom(src => src.AgeRestriction.ToString()))
            .ForMember(dest => dest.Genres, opt => opt.MapFrom(src => 
                src.MovieGenres.Select(mg => mg.Genre.Name)))
            .ForMember(dest => dest.Actors, opt => opt.MapFrom(src => 
                src.MovieActors.Select(ma => $"{ma.Actor.FirstName} {ma.Actor.LastName}")))
            .ForMember(dest => dest.Rating, opt => opt.MapFrom(src => 
                src.Rating.HasValue ? (double)src.Rating.Value : 0.0));
    }
}