using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Practice_team06.DTOs.Common;
using Practice_team06.DTOs.Movie;
using Practice_team06.Services;

namespace Practice_team06.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly IMovieService _movieService;

    public MoviesController(IMovieService movieService)
    {
        _movieService = movieService;
    }
    
    [HttpGet]
    public async Task<ActionResult<PagedResult<MovieDto>>> GetAll([FromQuery] MovieFilterDto filter)
    {
        var result = await _movieService.GetAllMoviesAsync(filter);
        return Ok(result);
    }
    
    [HttpGet("upcoming")]
    public async Task<ActionResult<PagedResult<MovieDto>>> GetUpcoming([FromQuery] MovieFilterDto filter)
    {
        var result = await _movieService.GetUpcomingMoviesAsync(filter);
        return Ok(result);
    }

    // [GET] "Зараз у кіно"
    [HttpGet("now-playing")]
    public async Task<ActionResult<PagedResult<MovieDto>>> GetNowPlaying([FromQuery] MovieFilterDto filter)
    {
        var result = await _movieService.GetNowPlayingMoviesAsync(filter);
        return Ok(result);
    }
    
    // [GET] Отримати деталі одного фільму
    [HttpGet("{id}")]
    public async Task<ActionResult<MovieDto>> GetById(int id)
    {
        var movie = await _movieService.GetMovieByIdAsync(id);
        if (movie == null) return NotFound(new { message = "Фільм не знайдено" });
        return Ok(movie);
    }

    // --- АДМІН ЧАСТИНА ---

    [HttpPost]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<ActionResult<MovieDto>> Create([FromBody] CreateMovieDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        
        try 
        {
            var created = await _movieService.CreateMovieAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<ActionResult<MovieDto>> Update(int id, [FromBody] CreateMovieDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var updatedMovie = await _movieService.UpdateMovieAsync(id, dto);
            return Ok(updatedMovie);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Фільм не знайдено" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _movieService.DeleteMovieAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Сталася помилка при видаленні фільму." });
        }
    }
    [HttpGet("recommendations")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<MovieDto>>> GetRecommendations([FromQuery] int count = 6)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized(new { message = "Користувач не ідентифікований" });
        }

        var result = await _movieService.GetRecommendationsAsync(userId, count);
        return Ok(result);
    }
}