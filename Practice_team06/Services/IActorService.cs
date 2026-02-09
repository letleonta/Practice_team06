using Practice_team06.DTOs.Actor;
using Practice_team06.DTOs.Common;

namespace Practice_team06.Services;

public interface IActorService
{
    Task<PagedResult<ActorDto>> GetAllAsync(ActorFilterDto filter);
    Task<ActorDto?> GetByIdAsync(int id);
    Task<ActorDto> CreateAsync(CreateActorDto actorDto);
    Task<IEnumerable<ActorDto>> CreateRangeAsync(IEnumerable<CreateActorDto> actorsDto);
    Task<bool> UpdateAsync(int id, CreateActorDto actorDto);
    Task<bool> DeleteAsync(int id);
    Task<PagedResult<ActorMovieDto>> GetActorMoviesAsync(int actorId, BaseFilterDto filter);
}