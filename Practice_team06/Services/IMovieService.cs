using Practice_team06.DTOs;
using Practice_team06.DTOs.Movie;

namespace Practice_team06.Services;
public interface IMovieService
{
    Task<List<MovieDto>> GetAllMoviesAsync();
    Task<List<MovieDto>> GetUpcomingMoviesAsync();
    Task<MovieDto?> GetMovieByIdAsync(int id);
    Task<MovieDto> CreateMovieAsync(CreateMovieDto dto);
    Task DeleteMovieAsync(int id);
}