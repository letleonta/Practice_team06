using AutoMapper;
using Practice_team06.DTOs.Genre;
using Practice_team06.Models;

namespace Practice_team06.Mappings;

public class GenreProfile : Profile
{
    public GenreProfile()
    {
        CreateMap<Genre, GenreDto>();
        
        CreateMap<CreateGenreDto, Genre>();
    }
}