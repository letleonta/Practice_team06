using Microsoft.AspNetCore.Mvc;
using Practice_team06.DTOs.Language;
using Practice_team06.Services;

namespace Practice_team06.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LanguagesController : ControllerBase
{
    private readonly ILanguageService _service;

    public LanguagesController(ILanguageService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetLanguages(
        [FromQuery] string? search,
        [FromQuery] string? sortBy,
        [FromQuery] bool isDescending = false)
    {
        var result = await _service.GetAllAsync(search, sortBy, isDescending);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetLanguage(int id)
    {
        var language = await _service.GetByIdAsync(id);
        if (language == null) return NotFound();

        return Ok(language);
    }

    [HttpPost]
    public async Task<IActionResult> CreateLanguage([FromBody] CreateLanguageDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetLanguage), new { id = created.Id }, created);
    }

    [HttpPost("range")]
    public async Task<IActionResult> CreateLanguages([FromBody] IEnumerable<CreateLanguageDto> dto)
    {
        var created = await _service.CreateRangeAsync(dto);
        return Ok(created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateLanguage(int id, [FromBody] CreateLanguageDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        if (!updated) return NotFound();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteLanguage(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted) return NotFound();

        return NoContent();
    }
}