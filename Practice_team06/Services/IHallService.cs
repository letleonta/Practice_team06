using Practice_team06.DTOs;

namespace Practice_team06.Services;

public interface IHallService
{
    Task<IEnumerable<HallDto>> GetAllAsync();
    Task<HallDto?> GetByIdAsync(short id);
    Task<HallDto> CreateAsync(CreateHallDto dto);
    Task<bool> DeleteAsync(short id);
    Task<int> GenerateStandardSeatsAsync(GenerateStandardSeatsDto dto);
    Task<int> GenerateFlexibleSeatsAsync(GenerateFlexibleSeatsDto dto);
}