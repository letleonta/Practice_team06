using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Practice_team06.DTOs;
using Practice_team06.Services;

namespace Practice_team06.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SessionsController : ControllerBase
{
    private readonly ISessionService _sessionService;

    public SessionsController(ISessionService sessionService)
    {
        _sessionService = sessionService;
    }

    // Для ЮЗЕРІВ: Сеанси для конкретного фільму
    [HttpGet("by-movie/{movieId}")]
    public async Task<ActionResult<List<SessionDto>>> GetByMovie(int movieId)
    {
        return Ok(await _sessionService.GetSessionsByMovieIdAsync(movieId));
    }
    
    // Для ЮЗЕРІВ: Отримати деталі конкретного сеансу
    [HttpGet("{id}")]
    public async Task<ActionResult<SessionDto>> GetById(int id)
    {
        var session = await _sessionService.GetSessionByIdAsync(id);
    
        if (session == null) 
        {
            return NotFound(new { message = "Session not found" });
        }
    
        return Ok(session);
    }

    //АДМІН ЧАСТИНА 

    //[Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<SessionDto>> Create([FromBody] CreateSessionDto dto)
    {
        try 
        {
            var created = await _sessionService.CreateSessionAsync(dto);
            return Ok(created);
        }
        catch (Exception ex)
        {
            // Якщо накладання сеансів - поверне помилку 400
            return BadRequest(new { message = ex.Message });
        }
    }

    //[Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _sessionService.DeleteSessionAsync(id);
        return NoContent();
    }
    
    // [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<ActionResult<SessionDto>> Update(int id, [FromBody] CreateSessionDto dto)
    {
        try
        {
            var updatedSession = await _sessionService.UpdateSessionAsync(id, dto);
            return Ok(updatedSession);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Сеанс не знайдено" });
        }
        catch (Exception ex)
        {
            // Помилка накладання часу або інша бізнес-помилка
            return BadRequest(new { message = ex.Message });
        }
    }
    
}