using AutoMapper;
using Practice_team06.Models;
using Practice_team06.DTOs.Language;

namespace Practice_team06.Mappings;

public class LanguageProfile : Profile
{
    public LanguageProfile()
    {
        CreateMap<Language, LanguageDto>();
        CreateMap<CreateLanguageDto, Language>();
    }
}