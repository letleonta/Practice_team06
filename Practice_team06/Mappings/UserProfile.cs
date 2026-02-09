using AutoMapper;
using Practice_team06.DTOs.Auth;
using Practice_team06.DTOs.User;
using Practice_team06.Models;

namespace Practice_team06.Mappings;

public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<RegisterDto, User>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email));
        
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Roles, opt => opt.Ignore());
    }
}