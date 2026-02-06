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

    // Для ЮЗЕРІВ: Отримати всі фільми
    [HttpGet]
    public async Task<ActionResult<PagedResult<MovieDto>>> GetAll([FromQuery] MovieFilterDto filter)
    {
        return Ok(await _movieService.GetAllMoviesAsync(filter));
    }

    // Для ЮЗЕРІВ: "Скоро у прокаті"
    [HttpGet("upcoming")]
    public async Task<ActionResult<PagedResult<MovieDto>>> GetUpcoming([FromQuery] MovieFilterDto filter)
    {
        return Ok(await _movieService.GetUpcomingMoviesAsync(filter));
    }
    // Для ЮЗЕРІВ: "Зараз у кіно"
    [HttpGet("now-playing")]
    public async Task<ActionResult<PagedResult<MovieDto>>> GetNowPlaying([FromQuery] MovieFilterDto filter)
    {
        return Ok(await _movieService.GetNowPlayingMoviesAsync(filter));
    }
    
    // Для ЮЗЕРІВ: Отримати деталі одного фільму
    [HttpGet("{id}")]
    public async Task<ActionResult<MovieDto>> GetById(int id)
    {
        var movie = await _movieService.GetMovieByIdAsync(id);
        if (movie == null) return NotFound();
        return Ok(movie);
    }
    //АДМІН ЧАСТИНА

    // Тільки Адмін може створювати
    [HttpPost]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<ActionResult<MovieDto>> Create([FromBody] CreateMovieDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        
        var created = await _movieService.CreateMovieAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // Тільки Адмін може видаляти
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> Delete(int id)
    {
        await _movieService.DeleteMovieAsync(id);
        return NoContent();
    }
    // Тільки Адмін може оновлювати
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
}