using Microsoft.AspNetCore.Mvc.RazorPages;
using Practice_team06.DTOs.Common;
using Practice_team06.DTOs.Director;

namespace Practice_team06.Services;

public interface IDirectorService
{
    Task<PagedResult<DirectorDto>> GetAllAsync(DirectorFilterDto filter);
    
    Task<DirectorDto?> GetByIdAsync(int id);
    
    Task<DirectorDto?> CreateAsync(CreateDirectorDto directorDto);
    
    Task<IEnumerable<DirectorDto>> CreateRangeAsync(IEnumerable<CreateDirectorDto> directorsDto);
    
    Task<bool> UpdateAsync(int id, CreateDirectorDto directorDto);
    
    Task<bool> DeleteAsync(int id);
    
    Task<IEnumerable<DirectorMovieDto>> GetDirectorMoviesAsync(int directorId);
}