using System.Collections.Generic;
using System.Threading.Tasks;
using Practice_team06.DTOs;

namespace Practice_team06.Services;

public interface IActorService
{
    Task<IEnumerable<ActorDto>> GetAllAsync();
    Task<ActorDto?> GetByIdAsync(int id);
    Task<ActorDto> CreateAsync(CreateActorDto actorDto);
    Task<bool> UpdateAsync(int id, CreateActorDto actorDto);
    Task<bool> DeleteAsync(int id);
}