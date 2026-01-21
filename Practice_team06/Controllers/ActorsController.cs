using System.Collections.Generic;
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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ActorDto>>> GetActors()
    {
        var actors = await _actorService.GetAllAsync();
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
    public async Task<ActionResult<ActorDto>> CreateActor(CreateActorDto actorDto)
    {
        var createdActor = await _actorService.CreateAsync(actorDto);
        return CreatedAtAction(nameof(GetActor), new { id = createdActor.Id }, createdActor);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateActor(int id, CreateActorDto actorDto)
    {
        var result = await _actorService.UpdateAsync(id, actorDto);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteActor(int id)
    {
        var result = await _actorService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}