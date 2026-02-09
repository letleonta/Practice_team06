using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Practice_team06.DTOs.Common;
using Practice_team06.DTOs.Genre;
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
    public async Task<ActionResult<PagedResult<LanguageDto>>> GetLanguages(
        [FromQuery] LanguageFilterDto filter)
    {
        var result = await _service.GetAllAsync(filter);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LanguageDto>> GetLanguage(int id)
    {
        var language = await _service.GetByIdAsync(id);
        if (language == null) return NotFound();

        return Ok(language);
    }

    [HttpPost]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<ActionResult<LanguageDto>> CreateLanguage(
        [FromBody] CreateLanguageDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetLanguage), new { id = created.Id }, created);
    }

    [HttpPost("bulk")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<ActionResult<IEnumerable<LanguageDto>>> CreateLanguages(
        [FromBody] IEnumerable<CreateLanguageDto>? dto)
    {
        var list = dto?.ToList();
        if (list == null || list.Count == 0)
            return BadRequest("Список мов не може бути порожнім.");

        var created = await _service.CreateRangeAsync(list);
        return Ok(created);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> UpdateLanguage(
        int id,
        [FromBody] CreateLanguageDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        if (!updated) return NotFound();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin, Manager")]
    public async Task<IActionResult> DeleteLanguage(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted) return NotFound();

        return NoContent();
    }
}
