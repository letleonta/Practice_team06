using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Practice_team06.DTOs.Common;
using Practice_team06.DTOs.Session;
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

    // [GET] АДМІНКА: Отримати всі сеанси (Таблиця з пагінацією)
    // Це новий метод, який використовує SessionFilterDto
    [HttpGet]
    public async Task<ActionResult<PagedResult<SessionDto>>> GetAll([FromQuery] SessionFilterDto filter)
    {
        var result = await _sessionService.GetAllSessionsAsync(filter);
        return Ok(result);
    }

    // [GET] КЛІЄНТ: Сеанси для конкретного фільму (список без пагінації)
    [HttpGet("by-movie/{movieId}")]
    public async Task<ActionResult<List<SessionDto>>> GetByMovie(int movieId, [FromQuery] SessionFilterDto filter)
    {
        var result = await _sessionService.GetSessionsByMovieIdAsync(movieId, filter);
        return Ok(result);
    }
    
    // [GET] Деталі конкретного сеансу
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

    // --- АДМІН ЧАСТИНА ---

    [HttpPost]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<ActionResult<SessionDto>> Create([FromBody] CreateSessionDto dto)
    {
        if (dto.StartTime < DateTime.UtcNow.AddMinutes(-1))
        {
            return BadRequest(new { message = "Не можна створювати сеанси у минулому часі." });
        }

        try 
        {
            var created = await _sessionService.CreateSessionAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin, Manager")]
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
            return BadRequest(new { message = ex.Message });
        }
    }
    
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> Delete(int id)
    {
        await _sessionService.DeleteSessionAsync(id);
        return NoContent();
    }
}