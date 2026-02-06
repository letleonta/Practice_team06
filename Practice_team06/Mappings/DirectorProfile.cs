using AutoMapper;
using Practice_team06.DTOs.Director;
using Practice_team06.Models;

namespace Practice_team06.Mappings;

public class DirectorProfile : Profile
{
    public DirectorProfile()
    {
        CreateMap<Director, DirectorDto>();
        
        CreateMap<CreateDirectorDto, Director>()
            .ForMember(dest => dest.Id, opt => opt.Ignore());
        
        CreateMap<Movie, DirectorMovieDto>()
            .ForMember(dest => dest.MovieId, opt => opt.MapFrom(src => src.Id));
    }
}