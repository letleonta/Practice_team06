using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Practice_team06.DTOs.Auth;
using Practice_team06.Models;

namespace Practice_team06.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole<int>> _roleManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IConfiguration _configuration;

    public AuthService(
        UserManager<User> userManager,
        RoleManager<IdentityRole<int>> roleManager,
        SignInManager<User> signInManager,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _signInManager = signInManager;
        _configuration = configuration;
    }

   public async Task<AuthResultDto> RegisterAsync(RegisterDto dto)
    {
        var user = new User
        {
            UserName = dto.Email,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            BirthDate = dto.BirthDate
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        
        if (!result.Succeeded)
        {
            return new AuthResultDto { Succeeded = false, Errors = result.Errors.Select(e => e.Description) };
        }

        await _userManager.AddToRoleAsync(user, "Customer");

        // ГЕНЕРУЄМО ТОКЕН ВІДРАЗУ
        var response = await GenerateToken(user);
        return new AuthResultDto { Succeeded = true, Response = response };
    }

    // ЛОГІН
    public async Task<LoginResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            return null;

        return await GenerateToken(user);
    }

    // ПРИВАТНИЙ МЕТОД ДЛЯ ГЕНЕРАЦІЇ JWT (щоб не дублювати код)
    private async Task<LoginResponseDto> GenerateToken(User user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var authClaims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Email!),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        foreach (var role in roles) authClaims.Add(new Claim(ClaimTypes.Role, role));

        var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var expiration = DateTime.Now.AddDays(7);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            expires: expiration,
            claims: authClaims,
            signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
        );

        return new LoginResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Expiration = expiration,
            Email = user.Email!
        };
    }
    public async Task<IdentityResult> ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return IdentityResult.Failed(new IdentityError { Description = "Користувача не знайдено" });
        return await _userManager.ChangePasswordAsync(user, dto.OldPassword, dto.NewPassword);
    }

    public async Task<string?> GeneratePasswordResetTokenAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        return user != null ? await _userManager.GeneratePasswordResetTokenAsync(user) : null;
    }

    public async Task<IdentityResult> ResetPasswordAsync(ResetPasswordDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null) 
            return IdentityResult.Failed(new IdentityError { Description = "Користувача не знайдено" });

        // Використовуємо UserManager для скидання
        return await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
    }
    // --- РЕАЛІЗАЦІЯ МЕТОДІВ, ЯКИХ НЕ ВИСТАЧАЛО ---

    public async Task<IdentityResult> AssignRoleAsync(string email, string roleName)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) 
            return IdentityResult.Failed(new IdentityError { Description = "Користувача не знайдено" });

        if (!await _roleManager.RoleExistsAsync(roleName))
            return IdentityResult.Failed(new IdentityError { Description = $"Ролі '{roleName}' не існує" });

        // 1. Отримуємо всі поточні ролі користувача
        var currentRoles = await _userManager.GetRolesAsync(user);

        // 2. Якщо користувач вже має ТІЛЬКИ цю роль і ніяких інших — нічого не робимо
        if (currentRoles.Count == 1 && currentRoles.Contains(roleName))
        {
            return IdentityResult.Success;
        }

        // 3. Видаляємо всі існуючі ролі
        if (currentRoles.Any())
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded) return removeResult;
        }

        // 4. Додаємо нову чисту роль
        return await _userManager.AddToRoleAsync(user, roleName);
    }

    public async Task<IEnumerable<object>> GetAllUsersWithRolesAsync()
    {
        var users = await _userManager.Users.ToListAsync();
        var userList = new List<object>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            userList.Add(new
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                Roles = roles
            });
        }

        return userList;
    }
}