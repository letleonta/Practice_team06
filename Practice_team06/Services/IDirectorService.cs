using Practice_team06.DTOs;

namespace Practice_team06.Services;

public interface IDirectorService
{
    Task<IEnumerable<DirectorDto>> GetAllAsync(string? search = null, string? sortBy = null, bool isDescending = false);
    
    Task<DirectorDto?> GetByIdAsync(int id);
    
    Task<DirectorDto?> CreateAsync(CreateDirectorDto directorDto);
    
    Task<IEnumerable<DirectorDto>> CreateRangeAsync(IEnumerable<CreateDirectorDto> directorsDto);
    
    Task<bool> UpdateAsync(int id, CreateDirectorDto directorDto);
    
    Task<bool> DeleteAsync(int id);
}