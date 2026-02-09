using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Practice_team06.DTOs.User;
using Practice_team06.Models;
using Practice_team06.Services;
using System.Security.Claims;

namespace Practice_team06.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;

    public UsersController(IUserService userService, UserManager<User> userManager, IMapper mapper)
    {
        _userService = userService;
        _userManager = userManager;
        _mapper = mapper;
    }

    [HttpGet("profile")]
    public async Task<ActionResult<UserDto>> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound();
        
        var userDto = _mapper.Map<UserDto>(user);
        
        userDto.Roles = (await _userManager.GetRolesAsync(user)).ToList();

        return Ok(userDto);
    }
    
    [HttpPost("avatar")]
    public async Task<ActionResult<object>> UpdateAvatar(IFormFile? file)
    {
        if (file == null || file.Length == 0) return BadRequest("Файл не обрано");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            var path = await _userService.UploadAvatarAsync(int.Parse(userId), file);
            return Ok(new { avatarUri = path });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    
    [HttpPut("profile")]
    public async Task<ActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound();
        
        _mapper.Map(dto, user);

        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded ? Ok(new { message = "Профіль оновлено" }) : BadRequest(result.Errors);
    }
    
    [HttpDelete("avatar")]
    public async Task<ActionResult> DeleteAvatar()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            await _userService.DeleteAvatarAsync(int.Parse(userId));
            return Ok(new { message = "Аватар видалено" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}