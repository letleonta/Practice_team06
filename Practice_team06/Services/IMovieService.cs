using Practice_team06.DTOs.Common;
using Practice_team06.DTOs.Movie;

namespace Practice_team06.Services;
public interface IMovieService
{
    Task<PagedResult<MovieDto>> GetAllMoviesAsync(MovieFilterDto filter);
    Task<PagedResult<MovieDto>> GetUpcomingMoviesAsync(MovieFilterDto filter);
    Task<PagedResult<MovieDto>> GetNowPlayingMoviesAsync(MovieFilterDto filter);
    Task<MovieDto?> GetMovieByIdAsync(int id);
    Task<MovieDto> CreateMovieAsync(CreateMovieDto dto);
    Task<MovieDto> UpdateMovieAsync(int id, CreateMovieDto dto);
    Task DeleteMovieAsync(int id);
}