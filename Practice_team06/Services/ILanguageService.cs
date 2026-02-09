using Practice_team06.DTOs.Common;
using Practice_team06.DTOs.Genre;
using Practice_team06.DTOs.Language;

namespace Practice_team06.Services;

public interface ILanguageService
{
    Task<PagedResult<LanguageDto>> GetAllAsync(LanguageFilterDto filter);
    Task<LanguageDto?> GetByIdAsync(int id);
    Task<LanguageDto> CreateAsync(CreateLanguageDto dto);
    Task<IEnumerable<LanguageDto>> CreateRangeAsync(IEnumerable<CreateLanguageDto> dto);
    Task<bool> UpdateAsync(int id, CreateLanguageDto dto);
    Task<bool> DeleteAsync(int id);
}