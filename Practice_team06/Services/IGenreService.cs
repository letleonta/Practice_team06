using Practice_team06.DTOs.Common;
using Practice_team06.DTOs.Genre;

namespace Practice_team06.Services;

public interface IGenreService
{
    Task<PagedResult<GenreDto>> GetAllAsync(GenreFilterDto filter);
    Task<GenreDto?> GetByIdAsync(int id);
    Task<GenreDto> CreateAsync(CreateGenreDto genreDto);
    Task<IEnumerable<GenreDto>> CreateRangeAsync(IEnumerable<CreateGenreDto> genresDto);
    Task<bool> UpdateAsync(int id, CreateGenreDto genreDto);
    Task<bool> DeleteAsync(int id);
}