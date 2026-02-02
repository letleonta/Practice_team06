using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Practice_team06.DTOs.Actor;
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
    [Authorize(Roles = "Admin, Customer, Manager")]
    public async Task<ActionResult<IEnumerable<ActorDto>>> GetActors([FromQuery] ActorFilterDto filter)
    {
        var actors = await _actorService.GetAllAsync(filter);

        return Ok(actors);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin, Customer, Manager")]
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
    [Authorize(Roles = "Admin, Customer, Manager")]
    public async Task<ActionResult<IEnumerable<ActorMovieDto>>> GetActorMovies(int id)
    {
        var movies = await _actorService.GetActorMoviesAsync(id);
        return Ok(movies);
    }

    [HttpPut("{id}")] 
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> UpdateActor(int id, CreateActorDto actorDto)
    {
        var result = await _actorService.UpdateAsync(id, actorDto);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")] 
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> DeleteActor(int id)
    {
        var result = await _actorService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}