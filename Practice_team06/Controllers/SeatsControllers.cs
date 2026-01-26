using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Practice_team06.DTOs;
using Practice_team06.Services;

namespace Practice_team06.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SeatsController : ControllerBase
{
    private readonly ISeatService _seatService;

    public SeatsController(ISeatService seatService) => _seatService = seatService;
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var seat = await _seatService.GetByIdAsync(id);
        return seat == null ? NotFound() : Ok(seat);
    }
    
    [HttpPut("{id}")]
    // [Authorize(Roles = "Admin")] 
    public async Task<IActionResult> Update(int id, UpdateSeatDto dto)
    {
        var result = await _seatService.UpdateSeatAsync(id, dto);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    // [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        return await _seatService.DeleteAsync(id) ? NoContent() : NotFound();
    }
    
    // GET: api/Seats/available/5
    [HttpGet("available/{sessionId}")]
    public async Task<IActionResult> GetAvailableSeats(int sessionId)
    {
        var seats = await _seatService.GetSeatsForSessionAsync(sessionId);
        if (!seats.Any()) return NotFound("Сеанс не знайдено або в залі немає місць");
    
        return Ok(seats);
    }
}