using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Practice_team06.DTOs;
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
    public async Task<ActionResult<List<MovieDto>>> GetAll()
    {
        return Ok(await _movieService.GetAllMoviesAsync());
    }
    
    // Для ЮЗЕРІВ: Отримати деталі одного фільму
    [HttpGet("{id}")]
    public async Task<ActionResult<MovieDto>> GetById(int id)
    {
        var movie = await _movieService.GetMovieByIdAsync(id);
        if (movie == null) return NotFound();
        return Ok(movie);
    }

    // Для ЮЗЕРІВ: "Скоро у прокаті"
    [HttpGet("upcoming")]
    public async Task<ActionResult<List<MovieDto>>> GetUpcoming()
    {
        return Ok(await _movieService.GetUpcomingMoviesAsync());
    }
    // Для ЮЗЕРІВ: "Зараз у кіно"
    [HttpGet("now-playing")]
    public async Task<ActionResult<List<MovieDto>>> GetNowPlaying()
    {
        return Ok(await _movieService.GetNowPlayingMoviesAsync());
    }
    //АДМІН ЧАСТИНА

    // Тільки Адмін може створювати
    //[Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<MovieDto>> Create([FromBody] CreateMovieDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        
        var created = await _movieService.CreateMovieAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // Тільки Адмін може видаляти
    //[Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _movieService.DeleteMovieAsync(id);
        return NoContent();
    }
}