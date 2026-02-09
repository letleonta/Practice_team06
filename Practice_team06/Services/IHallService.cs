using Practice_team06.DTOs.Common;
using Practice_team06.DTOs.Hall;

namespace Practice_team06.Services;

public interface IHallService
{
    Task<IEnumerable<HallDto>> GetAllAsync();
    Task<HallDto?> GetByIdAsync(int id);
    Task<HallDto> CreateAsync(CreateHallDto dto);
    Task<bool> DeleteAsync(int id);
    Task<int> GenerateStandardSeatsAsync(GenerateStandardSeatsDto dto);
    Task<int> GenerateFlexibleSeatsAsync(GenerateFlexibleSeatsDto dto);
    Task<PagedResult<HallDto>> GetPagedAsync(int page, int pageSize, string searchTerm);
    Task<object> AddRowToHallAsync(int id, RowConfigDto dto);
}