using System.Collections.Generic;
using System.Threading.Tasks;
using Practice_team06.DTOs;
using Practice_team06.DTOs.Genre;

namespace Practice_team06.Services;

public interface IGenreService
{
    Task<IEnumerable<GenreDto>> GetAllAsync(string? search = null, string? sortBy = null, bool isDescending = false);
    Task<GenreDto?> GetByIdAsync(int id);
    Task<GenreDto> CreateAsync(CreateGenreDto genreDto);
    Task<IEnumerable<GenreDto>> CreateRangeAsync(IEnumerable<CreateGenreDto> genresDto);
    Task<bool> UpdateAsync(int id, CreateGenreDto genreDto);
    Task<bool> DeleteAsync(int id);
}