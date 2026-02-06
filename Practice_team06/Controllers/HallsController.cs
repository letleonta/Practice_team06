using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Practice_team06.DTOs.Hall;
using Practice_team06.Services;

namespace Practice_team06.Controllers;

[Route("api/[controller]")]
[ApiController]
public class HallsController : ControllerBase
{
    private readonly IHallService _hallService;
    private readonly ISeatService _seatService;

    public HallsController(IHallService hallService, ISeatService seatService)
    {
        _hallService = hallService;
        _seatService = seatService;
    }


    [HttpGet("{id}/seats")]
    public async Task<IActionResult> GetHallSeats(int id)
    {
        var hall = await _hallService.GetByIdAsync(id);
        if (hall == null)
        {
            return NotFound(new { message = $"Зал з ID {id} не знайдено" });
        }

        var seats = await _seatService.GetSeatsByHallAsync(id);
        return Ok(seats);
    }


    [HttpGet]
    [Authorize(Roles = "Admin, Customer, Manager")]
    public async Task<IActionResult> GetAll() => Ok(await _hallService.GetAllAsync());

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin, Customer, Manager")]
    public async Task<IActionResult> GetById(int id)
    {
        var hall = await _hallService.GetByIdAsync(id);
        return hall == null ? NotFound() : Ok(hall);
    }

    [HttpPost]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> Create(CreateHallDto dto)
    {
        var result = await _hallService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> Delete(short id)
    {
        var result = await _hallService.DeleteAsync(id);
        return result ? NoContent() : NotFound();
    }

    [HttpPost("generate-standard-seats")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> GenerateStandardSeats(GenerateStandardSeatsDto dto)
    {
        var count = await _hallService.GenerateStandardSeatsAsync(dto);
        if (count == 0) return BadRequest("Не вдалося знайти зал.");
        return Ok(new { Message = $"Створено зал: {count} місць ({dto.RowCount} рядів по {dto.SeatsPerRow} місць)" });
    }

    [HttpPost("generate-flexible-seats")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> GenerateFlexibleSeats(GenerateFlexibleSeatsDto dto)
    {
        try 
        {
            var count = await _hallService.GenerateFlexibleSeatsAsync(dto);
            return Ok(new { message = $"Згенеровано {count} місць" });
        }
        catch (InvalidOperationException ex) 
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Внутрішня помилка сервера" });
        }
    }
    
    [HttpGet("paged")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> GetPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchTerm = "")
    {
        var result = await _hallService.GetPagedAsync(page, pageSize, searchTerm ?? "");
        return Ok(result);
    }
    
    [HttpPost("{id}/add-row")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> AddRow(int id, [FromBody] RowConfigDto dto)
    {
        try 
        {
            var count = await _hallService.AddRowToHallAsync(id, dto);
            return Ok(new { Message = $"Додано ряд №{dto.RowNumber} ({count} місць)" });
        }
        catch (InvalidOperationException ex) 
        {
            return BadRequest(ex.Message);
        }
    }
}