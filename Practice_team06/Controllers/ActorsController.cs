using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Practice_team06.DTOs;
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

    [HttpGet] //Client
    public async Task<ActionResult<IEnumerable<ActorDto>>> GetActors(
        [FromQuery] string? search = null, 
        [FromQuery] string? sortBy = null, 
        [FromQuery] bool isDescending = false)
    {
        var actors = await _actorService.GetAllAsync(search, sortBy, isDescending);
        return Ok(actors);
    }

    [HttpGet("{id}")] //Client
    public async Task<ActionResult<ActorDto>> GetActor(int id) 
    {
        var actor = await _actorService.GetByIdAsync(id);
        if (actor == null) return NotFound();
        return Ok(actor);
    }

    [HttpPost] //Admin
    public async Task<ActionResult<ActorDto>> CreateActor(CreateActorDto actorDto)
    {
        var createdActor = await _actorService.CreateAsync(actorDto);
        return CreatedAtAction(nameof(GetActor), new { id = createdActor.Id }, createdActor);
    }
    //для масиву акторів 
    [HttpPost("bulk")] //Admin
    public async Task<ActionResult<IEnumerable<ActorDto>>> CreateActors(IEnumerable<CreateActorDto> actorsDto)
    {
        if (actorsDto == null || !actorsDto.Any())
        {
            return BadRequest("Список акторів не може бути порожнім.");
        }

        var createdActors = await _actorService.CreateRangeAsync(actorsDto);
        return Ok(createdActors);
    }
    
    [HttpGet("{id}/movies")]
    public async Task<ActionResult<IEnumerable<ActorMovieDto>>> GetActorMovies(int id)
    {
        var movies = await _actorService.GetActorMoviesAsync(id);
        return Ok(movies);
    }

    [HttpPut("{id}")] //Admin
    public async Task<IActionResult> UpdateActor(int id, CreateActorDto actorDto)
    {
        var result = await _actorService.UpdateAsync(id, actorDto);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")] //Admin
    public async Task<IActionResult> DeleteActor(int id)
    {
        var result = await _actorService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}