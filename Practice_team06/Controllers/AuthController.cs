using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Auth;
using Practice_team06.Models;
using Practice_team06.Services;

namespace Practice_team06.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Реєстрація нового користувача.
    /// Доступ: ПУБЛІЧНИЙ.
    /// Автоматично призначає роль "Customer".
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        var result = await _authService.RegisterAsync(model);

        if (result.Succeeded)
        {
            // Повертаємо токен відразу після реєстрації
            return Ok(result.Response);
        }

        return BadRequest(new { errors = result.Errors });
    }

    /// <summary>
    /// Вхід у систему.
    /// Доступ: ПУБЛІЧНИЙ.
    /// Повертає JWT-токен для авторизації в інших методах.
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        var response = await _authService.LoginAsync(model);

        if (response == null)
        {
            return Unauthorized(new { message = "Невірний email або пароль" });
        }

        return Ok(response);
    }

    /// <summary>
    /// Зміна пароля (для залогованих користувачів).
    /// Доступ: АВТОРИЗОВАНИЙ (Будь-яка роль).
    /// Потребує знання старого пароля.
    /// </summary>
    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
    {
        // Дістаємо ID користувача з JWT токена
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();

        var result = await _authService.ChangePasswordAsync(int.Parse(userIdClaim), model);

        if (result.Succeeded)
        {
            return Ok(new { message = "Пароль змінено успішно" });
        }

        return BadRequest(result.Errors);
    }

    /// <summary>
    /// Запит на відновлення пароля (якщо забули).
    /// Доступ: ПУБЛІЧНИЙ.
    /// Повертає токен скидання (у реальному проєкті він шлеться на email).
    /// </summary>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
    {
        var token = await _authService.GeneratePasswordResetTokenAsync(model.Email);
        
        if (token == null)
        {
            // Для безпеки повертаємо OK, навіть якщо email не знайдено
            return Ok(new { message = "Якщо пошта зареєстрована, інструкції надіслано." });
        }

        return Ok(new { 
            message = "Токен згенеровано. Використовуйте його у методі reset-password.",
            resetToken = token 
        });
    }

    /// <summary>
    /// Скидання пароля за допомогою токена.
    /// Доступ: ПУБЛІЧНИЙ.
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
    {
        var result = await _authService.ResetPasswordAsync(model);

        if (result.Succeeded)
        {
            return Ok(new { message = "Пароль успішно скинуто. Тепер ви можете увійти з новим паролем." });
        }

        return BadRequest(result.Errors);
    }

    // --- АДМІНІСТРАТИВНА ЧАСТИНА ---

    /// <summary>
    /// Призначення ролі користувачу.
    /// Доступ: ТІЛЬКИ АДМІНІСТРАТОР.
    /// </summary>
    [HttpPost("assign-role")]
    [Authorize(Roles = "Admin, Manager")] 
    public async Task<IActionResult> AssignRole([FromQuery] string email, [FromQuery] string roleName)
    {
        var result = await _authService.AssignRoleAsync(email, roleName);
        
        if (result.Succeeded)
        {
            return Ok(new { message = $"Користувачу {email} успішно призначено роль {roleName}" });
        }

        return BadRequest(result.Errors);
    }

    /// <summary>
    /// Список усіх користувачів та їхніх ролей.
    /// Доступ: ТІЛЬКИ АДМІНІСТРАТОР.
    /// </summary>
    [HttpGet("users")]
    [Authorize(Roles = "Admin, Manager")] 
    public async Task<IActionResult> GetUsers()
    {
        var users = await _authService.GetAllUsersWithRolesAsync();
        return Ok(users);
    }
}