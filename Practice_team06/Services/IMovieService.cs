using Practice_team06.DTOs.Movie;

namespace Practice_team06.Services;
public interface IMovieService
{
    Task<List<MovieDto>> GetAllMoviesAsync(MovieFilterDto? filter);
    Task<List<MovieDto>> GetUpcomingMoviesAsync(MovieFilterDto? filter);
    Task<List<MovieDto>> GetNowPlayingMoviesAsync(MovieFilterDto? filter);
    Task<MovieDto?> GetMovieByIdAsync(int id);
    Task<MovieDto> CreateMovieAsync(CreateMovieDto dto);
    Task<MovieDto> UpdateMovieAsync(int id, CreateMovieDto dto);
    Task DeleteMovieAsync(int id);
}