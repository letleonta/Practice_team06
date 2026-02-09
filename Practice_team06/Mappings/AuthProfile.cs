using AutoMapper;
using Practice_team06.DTOs.Auth;
using Practice_team06.Models;

namespace Practice_team06.Mappings;

public class AuthProfile : Profile
{
    public AuthProfile()
    {
        CreateMap<RegisterDto, User>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.Id, opt => opt.Ignore());
    }
}