using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Practice_team06.DTOs.User;
using Practice_team06.Models;
using Practice_team06.Services;

namespace Practice_team06.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UsersController(IUserService userService, UserManager<User> userManager) : ControllerBase
{
    [HttpGet("profile")]
    public async Task<ActionResult<UserDto>> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return NotFound();

        return Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            BirthDate = user.BirthDate,
            AvatarUrl = user.AvatarUri
        });
    }
    
    [HttpPost("avatar")]
    public async Task<IActionResult> UpdateAvatar(IFormFile? file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Файл не обрано");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            var path = await userService.UploadAvatarAsync(int.Parse(userId), file);
            return Ok(new { avatarUrl = path });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return NotFound();

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.BirthDate = dto.BirthDate;

        var result = await userManager.UpdateAsync(user);
        return result.Succeeded ? Ok("Профіль оновлено") : BadRequest(result.Errors);
    }
    
    [HttpDelete("avatar")]
    public async Task<IActionResult> DeleteAvatar()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            await userService.DeleteAvatarAsync(int.Parse(userId));
            return Ok(new { message = "Аватар видалено" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}