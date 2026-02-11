using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Practice_team06.DTOs.Auth;
using Practice_team06.DTOs.User;
using Practice_team06.Services;
using System.Security.Claims;
using Practice_team06.DTOs.Common;

namespace Practice_team06.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IMapper _mapper;

    public AuthController(IAuthService authService, IMapper mapper)
    {
        _authService = authService;
        _mapper = mapper;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResultDto>> Register([FromBody] RegisterDto model)
    {
        var result = await _authService.RegisterAsync(model);
        if (result.Succeeded) return Ok(result);
        
        return BadRequest(new { errors = result.Errors });
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto model)
    {
        var response = await _authService.LoginAsync(model);
        if (response == null) return Unauthorized(new { message = "Невірний email або пароль" });

        return Ok(response);
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto model)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();

        var result = await _authService.ChangePasswordAsync(int.Parse(userIdClaim), model);
        if (result.Succeeded) return Ok(new { message = "Пароль змінено успішно" });

        return BadRequest(result.Errors);
    }

    [Authorize]
    [HttpPost("change-email")]
    public async Task<ActionResult<LoginResponseDto>> ChangeEmail([FromBody] ChangeEmailDto dto)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();

        try
        {
            var response = await _authService.ChangeEmailAsync(int.Parse(userIdClaim), dto);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
    {
        var token = await _authService.GeneratePasswordResetTokenAsync(model.Email);
        return Ok(new { message = "Якщо пошта зареєстрована, інструкції надіслано.", resetToken = token });
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordDto model)
    {
        var result = await _authService.ResetPasswordAsync(model);
        if (result.Succeeded) return Ok(new { message = "Пароль успішно скинуто" });

        return BadRequest(result.Errors);
    }

    [HttpPost("assign-role")]
    [Authorize(Roles = "Admin, Manager")] 
    public async Task<ActionResult> AssignRole([FromQuery] string email, [FromQuery] string roleName)
    {
        var result = await _authService.AssignRoleAsync(email, roleName);
        if (result.Succeeded) return Ok(new { message = $"Користувачу {email} успішно призначено роль {roleName}" });

        return BadRequest(result.Errors);
    }

    [HttpGet("users")]
    [Authorize(Roles = "Admin, Manager")] 
    public async Task<ActionResult<PagedResult<UserDto>>> GetUsers([FromQuery] UserFilterDto filter)
    {
        var result = await _authService.GetAllUsersPagedAsync(filter);
    
        return Ok(result);
    }
}