using Microsoft.AspNetCore.Mvc;
using Practice_team06.DTOs;
using Practice_team06.DTOs.Director;
using Practice_team06.Services;

namespace Practice_team06.Controllers;

[Route("api/[controller]")]
[ApiController] 
public class DirectorsController : ControllerBase
{
    private readonly IDirectorService _directorService;

    public DirectorsController(IDirectorService directorService)
    {
        _directorService = directorService;
    }

    [HttpGet] //Client
    public async Task<ActionResult<IEnumerable<DirectorDto>>> GetDirectors(
        [FromQuery] string? search = null, 
        [FromQuery] string? sortBy = null, 
        [FromQuery] bool isDescending = false)
    {
        var directors = await _directorService.GetAllAsync(search, sortBy, isDescending);
        return Ok(directors);
    }

    [HttpGet("{id}")] //Client
    public async Task<ActionResult<DirectorDto>> GetDirector(int id) 
    {
        var director = await _directorService.GetByIdAsync(id);
        if (director == null) return NotFound();
        return Ok(director);
    }

    [HttpPost] //Admin
    public async Task<ActionResult<DirectorDto>> CreateDirector(CreateDirectorDto directorDto)
    {
        var createdDirector = await _directorService.CreateAsync(directorDto);
        return CreatedAtAction(nameof(GetDirector), new { id = createdDirector.Id }, createdDirector);
    }
    //для масиву акторів 
    [HttpPost("bulk")] //Admin
    public async Task<ActionResult<IEnumerable<DirectorDto>>> CreateDirectors(IEnumerable<CreateDirectorDto> directorsDto)
    {
        if (directorsDto == null || !directorsDto.Any())
        {
            return BadRequest("Список акторів не може бути порожнім.");
        }

        var createdDirectors = await _directorService.CreateRangeAsync(directorsDto);
        return Ok(createdDirectors);
    }

    [HttpPut("{id}")] //Admin
    public async Task<IActionResult> UpdateDirector(int id, CreateDirectorDto directorDto)
    {
        var result = await _directorService.UpdateAsync(id, directorDto);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")] //Admin
    public async Task<IActionResult> DeleteDirector(int id)
    {
        var result = await _directorService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}