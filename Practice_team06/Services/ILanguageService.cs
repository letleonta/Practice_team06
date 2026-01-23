using System.Collections.Generic;
using System.Threading.Tasks;
using Practice_team06.DTOs;

namespace Practice_team06.Services;

public interface ILanguageService
{
    Task<IEnumerable<LanguageDto>> GetAllAsync(
        string? search = null,
        string? sortBy = null,
        bool isDescending = false);

    Task<LanguageDto?> GetByIdAsync(int id);
    Task<LanguageDto> CreateAsync(CreateLanguageDto dto);
    Task<IEnumerable<LanguageDto>> CreateRangeAsync(IEnumerable<CreateLanguageDto> dto);
    Task<bool> UpdateAsync(int id, CreateLanguageDto dto);
    Task<bool> DeleteAsync(int id);
}