using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Practice_team06.DTOs.Auth;
using Practice_team06.DTOs.User;
using Practice_team06.Models;

namespace Practice_team06.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole<int>> _roleManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly IMapper _mapper; 

    public AuthService(
        UserManager<User> userManager,
        RoleManager<IdentityRole<int>> roleManager,
        SignInManager<User> signInManager,
        IConfiguration configuration,
        IMapper mapper) 
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _mapper = mapper; 
    }

    public async Task<AuthResultDto> RegisterAsync(RegisterDto dto)
    {
        var user = _mapper.Map<User>(dto);

        var result = await _userManager.CreateAsync(user, dto.Password);
        
        if (!result.Succeeded)
        {
            return new AuthResultDto { Succeeded = false, Errors = result.Errors.Select(e => e.Description) };
        }

        await _userManager.AddToRoleAsync(user, "Customer");

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

    //МЕТОД ДЛЯ ГЕНЕРАЦІЇ JWT
    private async Task<LoginResponseDto> GenerateToken(User user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var authClaims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.FirstName),
            new Claim(ClaimTypes.Email, user.Email!),
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
    public async Task<LoginResponseDto?> ChangeEmailAsync(int userId, ChangeEmailDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return null;
        
        var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.CurrentPassword);
        if (!isPasswordValid)
        {
            throw new Exception("Невірний поточний пароль.");
        }
        
        var existingUser = await _userManager.FindByEmailAsync(dto.NewEmail);
        if (existingUser != null && existingUser.Id != userId)
        {
            throw new Exception("Цей Email вже використовується іншим користувачем.");
        }
        
        user.Email = dto.NewEmail;
        user.UserName = dto.NewEmail;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new Exception("Помилка при оновленні профілю.");
        }
        
        return await GenerateToken(user);
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

        return await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
    }

    public async Task<IdentityResult> AssignRoleAsync(string email, string roleName)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) 
            return IdentityResult.Failed(new IdentityError { Description = "Користувача не знайдено" });

        if (!await _roleManager.RoleExistsAsync(roleName))
            return IdentityResult.Failed(new IdentityError { Description = $"Ролі '{roleName}' не існує" });
        
        var currentRoles = await _userManager.GetRolesAsync(user);
        
        if (currentRoles.Count == 1 && currentRoles.Contains(roleName))
        {
            return IdentityResult.Success;
        }
        
        if (currentRoles.Any())
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded) return removeResult;
        }
        
        return await _userManager.AddToRoleAsync(user, roleName);
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersWithRolesAsync()
    {
        var users = await _userManager.Users.ToListAsync();
        var userDtos = new List<UserDto>();

        foreach (var user in users)
        {
            var dto = _mapper.Map<UserDto>(user);
            var roles = await _userManager.GetRolesAsync(user);
            dto.Roles = roles.ToList();
        
            userDtos.Add(dto);
        }

        return userDtos;
    }
}