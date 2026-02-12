using Practice_team06.DTOs.Common;
using Practice_team06.DTOs.Session;

namespace Practice_team06.Services;

public interface ISessionService
{
    Task<PagedResult<SessionDto>> GetSessionsByMovieIdAsync(int movieId, SessionFilterDto filter);
    Task<SessionDto?> GetSessionByIdAsync(int id);
    Task<SessionDto> CreateSessionAsync(CreateSessionDto dto);
    Task<SessionDto> UpdateSessionAsync(int id, CreateSessionDto dto);
    Task DeleteSessionAsync(int id);
    Task<PagedResult<SessionDto>> GetAllSessionsAsync(SessionFilterDto filter);
    Task CreateBatchAsync(List<CreateSessionDto> dto);
}