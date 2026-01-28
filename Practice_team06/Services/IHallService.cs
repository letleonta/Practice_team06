using Practice_team06.DTOs.Hall;

namespace Practice_team06.Services;

public interface IHallService
{
    Task<IEnumerable<HallDto>> GetAllAsync();
    Task<HallDto?> GetByIdAsync(int id);
    Task<HallDto> CreateAsync(CreateHallDto dto);
    Task<bool> DeleteAsync(short id);
    Task<int> GenerateStandardSeatsAsync(GenerateStandardSeatsDto dto);
    Task<int> GenerateFlexibleSeatsAsync(GenerateFlexibleSeatsDto dto);
}