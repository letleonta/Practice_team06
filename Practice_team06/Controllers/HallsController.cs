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
    
    [HttpGet]
    [Authorize(Roles = "Admin, Customer, Manager")]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10, 
        [FromQuery] string? searchTerm = null)
    {
        var result = await _hallService.GetAllAsync(page, pageSize, searchTerm);
        return Ok(result);
    }
    
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
        try 
        {
            var result = await _hallService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
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
            var result = await _hallService.DeleteAsync(id);
        
            if (!result) 
            {
                return NotFound(new { message = $"Зал з ID {id} не знайдено." });
            }

            return NoContent();
        }
        catch (Exception)
        {
            return BadRequest(new { message = "Неможливо видалити зал: на нього вже продано квитки або існують активні сеанси." });
        }
    }
        
    [HttpPost("{id}/rows")]
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
            return BadRequest(new { message = ex.Message });
        }
    }
    
    [HttpPost("{id}/seats/add-to-row/{rowNumber}")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> AddSeatToRow(int id, int rowNumber)
    {
        try 
        {
            var result = await _seatService.AddSeatToRowAsync(id, rowNumber);
            return Ok(result);
        }
        catch (Exception ex)
        {
             return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}/rows/{rowNumber}")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> DeleteRow(int id, int rowNumber)
    {
        try 
        {
            var result = await _seatService.DeleteRowAsync(id, rowNumber);
            return result ? NoContent() : NotFound(new { message = "Ряд або зал не знайдено" });
        }
        catch (InvalidOperationException ex) 
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/rows/{rowNumber}/shift/{delta}")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> ShiftRow(int id, int rowNumber, int delta)
    {
        try 
        {
            await _seatService.ShiftRowAsync(id, rowNumber, delta);
            return Ok();
        }
        catch (InvalidOperationException ex) 
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}