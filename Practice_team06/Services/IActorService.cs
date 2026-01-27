using Practice_team06.DTOs.Actor;

namespace Practice_team06.Services;

public interface IActorService
{
    Task<IEnumerable<ActorDto>> GetAllAsync(string? search = null, string? sortBy = null, bool isDescending = false);
    Task<ActorDto?> GetByIdAsync(int id);
    Task<ActorDto> CreateAsync(CreateActorDto actorDto);
    Task<IEnumerable<ActorDto>> CreateRangeAsync(IEnumerable<CreateActorDto> actorsDto);
    Task<bool> UpdateAsync(int id, CreateActorDto actorDto);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<ActorMovieDto>> GetActorMoviesAsync(int actorId);
}