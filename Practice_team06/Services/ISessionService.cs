using Practice_team06.DTOs;
using Practice_team06.DTOs.Session;

namespace Practice_team06.Services;

public interface ISessionService
{
    Task<List<SessionDto>> GetSessionsByMovieIdAsync(int movieId);
    Task<SessionDto> CreateSessionAsync(CreateSessionDto dto);
    Task DeleteSessionAsync(int id);
}