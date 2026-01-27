using Microsoft.AspNetCore.Mvc;
using Practice_team06.DTOs.Genre;
using Practice_team06.Services;

namespace Practice_team06.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GenresController : ControllerBase
{
    private readonly IGenreService _genreService;

    public GenresController(IGenreService genreService)
    {
        _genreService = genreService;
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GenreDto>>> GetGenres(
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool isDescending = false)
    {
        var genres = await _genreService.GetAllAsync(search, sortBy, isDescending);
        return Ok(genres);
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<GenreDto>> GetGenre(int id)
    {
        var genre = await _genreService.GetByIdAsync(id);
        if (genre == null) return NotFound();
        return Ok(genre);
    }
    
    [HttpPost]
    public async Task<ActionResult<GenreDto>> CreateGenre(CreateGenreDto genreDto)
    {
        var createdGenre = await _genreService.CreateAsync(genreDto);
        return CreatedAtAction(nameof(GetGenre), new { id = createdGenre.Id }, createdGenre);
    }
    
    [HttpPost("bulk")]
    public async Task<ActionResult<IEnumerable<GenreDto>>> CreateGenres(IEnumerable<CreateGenreDto>? genresDto)
    {
        var genresList = genresDto?.ToList();
        if (genresList == null || genresList.Count == 0)
        {
            return BadRequest("Список жанрів не може бути порожнім.");
        }

        var createdGenres = await _genreService.CreateRangeAsync(genresList);
        return Ok(createdGenres);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGenre(int id, CreateGenreDto genreDto)
    {
        var result = await _genreService.UpdateAsync(id, genreDto);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGenre(int id)
    {
        var result = await _genreService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
