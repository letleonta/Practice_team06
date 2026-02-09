using AutoMapper;
using Practice_team06.Models;
using Practice_team06.DTOs.Hall;


namespace Practice_team06.Mappings;

public class HallProfile : Profile
{
    public HallProfile()
    {
        CreateMap<Hall, HallDto>();

        CreateMap<CreateHallDto, Hall>();
    }
}