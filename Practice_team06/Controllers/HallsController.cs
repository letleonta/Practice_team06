using Microsoft.AspNetCore.Mvc;
using Practice_team06.DTOs;
using Practice_team06.Services;

namespace Practice_team06.Controllers;

[Route("api/[controller]")]
[ApiController]
public class HallsController : ControllerBase
{
    private readonly IHallService _hallService;

    public HallsController(IHallService hallService) => _hallService = hallService;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _hallService.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(short id)
    {
        var hall = await _hallService.GetByIdAsync(id);
        return hall == null ? NotFound() : Ok(hall);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateHallDto dto)
    {
        var result = await _hallService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(short id)
    {
        var result = await _hallService.DeleteAsync(id);
        return result ? NoContent() : NotFound();
    }
    
    [HttpPost("generate-standard-seats")]
    public async Task<IActionResult> GenerateStandardSeats(GenerateStandardSeatsDto dto)
    {
        var count = await _hallService.GenerateStandardSeatsAsync(dto);
        if (count == 0) return BadRequest("Не вдалося знайти зал.");
        return Ok(new { Message = $"Створено зал: {count} місць ({dto.RowCount} рядів по {dto.SeatsPerRow} місць)" });
    }
    
    [HttpPost("generate-flexible-seats")]
    public async Task<IActionResult> GenerateFlexibleSeats(GenerateFlexibleSeatsDto dto)
    {
        var count = await _hallService.GenerateFlexibleSeatsAsync(dto);
        if (count == 0) return BadRequest("Не вдалося згенерувати місця. Перевірте HallId.");
        return Ok(new { Message = $"Створено {count} місць для залу №{dto.HallId}" });
    }
}