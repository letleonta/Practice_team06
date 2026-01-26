using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs;
using Practice_team06.DTOs.Auth;
using Practice_team06.Models;

namespace Practice_team06.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly RoleManager<IdentityRole<int>> _roleManager; 
    
    public AuthController(
        UserManager<User> userManager, 
        SignInManager<User> signInManager,
        RoleManager<IdentityRole<int>> roleManager) 
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _roleManager = roleManager;
    }

    // РЕЄСТРАЦІЯ
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        var user = new User
        {
            UserName = model.Email,
            Email = model.Email,
            FirstName = model.FirstName,
            LastName = model.LastName,
            BirthDate = model.BirthDate
        };

        var result = await _userManager.CreateAsync(user, model.Password);

        if (result.Succeeded)
        {
            // Призначаємо роль за замовчуванням
            await _userManager.AddToRoleAsync(user, "Customer");
            return Ok(new { message = "Користувача створено успішно" });
        }

        return BadRequest(result.Errors);
    }

    // ЛОГІН
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        var result = await _signInManager.PasswordSignInAsync(model.Email, model.Password, isPersistent: false, lockoutOnFailure: true);

        if (result.Succeeded)
        {
            return Ok(new { message = "Вхід успішний" });
        }

        if (result.IsLockedOut)
        {
            return BadRequest("Акаунт заблоковано через багато невдалих спроб.");
        }

        return Unauthorized("Невірний логін або пароль");
    }

    // ВИХІД
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok(new { message = "Вихід успішний" });
    }
    
    // ПРИЗНАЧЕННЯ РОЛІ (Тільки для Адміна)
    [HttpPost("assign-role")]
    [Authorize(Roles = "Admin")] // Тільки існуючий адмін може призначити роль іншому
    public async Task<IActionResult> AssignRole(string email, string roleName)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return NotFound("Користувача не знайдено");

        // Перевіряємо чи існує така роль
        var roleExists = await _roleManager.RoleExistsAsync(roleName);
        if (!roleExists) return BadRequest("Такої ролі не існує");

        // Додаємо роль користувачу
        var result = await _userManager.AddToRoleAsync(user, roleName);

        if (result.Succeeded)
        {
            return Ok(new { message = $"Користувачу {email} успішно призначено роль {roleName}" });
        }

        return BadRequest(result.Errors);
    }

// ОТРИМАТИ СПИСОК УСІХ КОРИСТУВАЧІВ ТА ЇХ РОЛЕЙ
    [HttpGet("users")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userManager.Users.ToListAsync();
        var userList = new List<object>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            userList.Add(new { user.Id, user.Email, user.FirstName, user.LastName, Roles = roles });
        }

        return Ok(userList);
    }
}