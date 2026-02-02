using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    
    [HttpGet] 
    [Authorize(Roles = "Admin, Customer, Manager")]
    public async Task<ActionResult<IEnumerable<DirectorDto>>> GetDirectors([FromQuery] DirectorFilterDto filter)
    {
        var directors = await _directorService.GetAllAsync(filter);

        return Ok(directors);
    }

    [HttpGet("{id}")] 
    [Authorize(Roles = "Admin, Customer, Manager")]
    public async Task<ActionResult<DirectorDto>> GetDirector(int id) 
    {
        var director = await _directorService.GetByIdAsync(id);
        if (director == null) return NotFound();
        return Ok(director);
    }

    [HttpPost]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<ActionResult<DirectorDto>> CreateDirector(CreateDirectorDto directorDto)
    {
        var createdDirector = await _directorService.CreateAsync(directorDto);
        
        if (createdDirector == null)
        {
            return BadRequest("Не вдалося створити режисера."); 
        }
        
        return CreatedAtAction(nameof(GetDirector), new { id = createdDirector.Id }, createdDirector);
    }
    
    [HttpPost("bulk")] 
    [Authorize(Roles = "Admin, Manager")]
    public async Task<ActionResult<IEnumerable<DirectorDto>>> CreateDirectors(IEnumerable<CreateDirectorDto>? directorsDto)
    {
        var directorsList = directorsDto?.ToList();
        if (directorsList == null || directorsList.Count == 0)
        {
            return BadRequest("Список акторів не може бути порожнім.");
        }

        var createdDirectors = await _directorService.CreateRangeAsync(directorsList);
        return Ok(createdDirectors);
    }

    [HttpGet("{id}/movies")]
    [Authorize(Roles = "Admin, Customer, Manager")]
    public async Task<ActionResult<IEnumerable<DirectorMovieDto>>> GetDirectorMovies(int id)
    {
        var movies = await _directorService.GetDirectorMoviesAsync(id);
        return Ok(movies);
    }
    
    [HttpPut("{id}")] 
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> UpdateDirector(int id, CreateDirectorDto directorDto)
    {
        var result = await _directorService.UpdateAsync(id, directorDto);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> DeleteDirector(int id)
    {
        var result = await _directorService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}