using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Practice_team06.DTOs.Seat;
using Practice_team06.Services;

namespace Practice_team06.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SeatsController : ControllerBase
{
    private readonly ISeatService _seatService;

    public SeatsController(ISeatService seatService) => _seatService = seatService;
    
    [HttpGet("hall/{hallId}")]
    [Authorize(Roles = "Admin, Customer, Manager")]
    public async Task<IActionResult> GetByHall(int hallId) 
        => Ok(await _seatService.GetSeatsByHallAsync(hallId));

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin, Customer, Manager")]
    public async Task<IActionResult> GetById(int id)
    {
        var seat = await _seatService.GetByIdAsync(id);
        return seat == null ? NotFound() : Ok(seat);
    }
    
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSeatDto dto) 
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _seatService.UpdateSeatAsync(id, dto);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> Delete(int id)
    {
        return await _seatService.DeleteAsync(id) ? NoContent() : NotFound();
    }
    
    [HttpGet("available/{sessionId}")]
    [Authorize(Roles = "Manager, Admin, Customer")]
    public async Task<IActionResult> GetAvailableSeats(int sessionId)
    {
        var seats = await _seatService.GetSeatsForSessionAsync(sessionId);
        if (!seats.Any()) return NotFound("Сеанс не знайдено або в залі немає місць");
    
        return Ok(seats);
    }
}