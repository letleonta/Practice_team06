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
    
    Task<DirectorDto> UpdateAsync(int id, CreateDirectorDto directorDto);
    
    Task DeleteAsync(int id);
    
    Task<PagedResult<DirectorMovieDto>> GetDirectorMoviesAsync(int actorId, BaseFilterDto filter);
}