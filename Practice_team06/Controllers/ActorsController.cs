using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Practice_team06.DTOs.Actor;
using Practice_team06.DTOs.Common;
using Practice_team06.Services;

namespace Practice_team06.Controllers;

[Route("api/[controller]")]
[ApiController] 
public class ActorsController : ControllerBase
{
    private readonly IActorService _actorService;

    public ActorsController(IActorService actorService)
    {
        _actorService = actorService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ActorDto>>> GetActors([FromQuery] ActorFilterDto filter)
    {
        var actors = await _actorService.GetAllAsync(filter);

        return Ok(actors);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ActorDto>> GetActor(int id) 
    {
        var actor = await _actorService.GetByIdAsync(id);
        if (actor == null) return NotFound();
        return Ok(actor);
    }

    [HttpPost]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<ActionResult<ActorDto>> CreateActor(CreateActorDto actorDto)
    {
        var createdActor = await _actorService.CreateAsync(actorDto);
        return CreatedAtAction(nameof(GetActor), new { id = createdActor.Id }, createdActor);
    }
    
    [HttpPost("bulk")] 
    [Authorize(Roles = "Admin, Manager")]
    public async Task<ActionResult<IEnumerable<ActorDto>>> CreateActors(IEnumerable<CreateActorDto>? actorsDto)
    {
        var actorsList = actorsDto?.ToList();
        if (actorsList == null || actorsList.Count == 0)
        {
            return BadRequest("Список акторів не може бути порожнім.");
        }

        var createdActors = await _actorService.CreateRangeAsync(actorsList);
        return Ok(createdActors);
    }
    
    [HttpGet("{id}/movies")]
    public async Task<ActionResult<PagedResult<ActorMovieDto>>> GetActorMovies(int id, [FromQuery] BaseFilterDto filter)
    {
        var result = await _actorService.GetActorMoviesAsync(id, filter);
        return Ok(result);
    }
    
    [HttpPut("{id}")] 
    [Authorize(Roles = "Admin, Manager")]
    public async Task<ActionResult<ActorDto>> UpdateActor(int id, CreateActorDto actorDto)
    {
        try
        {
            var updatedActor = await _actorService.UpdateAsync(id, actorDto);
            return Ok(updatedActor); 
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpDelete("{id}")] 
    [Authorize(Roles = "Admin, Manager")]
    public async Task<ActionResult> DeleteActor(int id) 
    {
        try
        {
            await _actorService.DeleteAsync(id);
            return NoContent(); 
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
}