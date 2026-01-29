using Microsoft.AspNetCore.Identity;
using Practice_team06.DTOs.Auth;

namespace Practice_team06.Services;

public interface IAuthService
{
    Task<AuthResultDto> RegisterAsync(RegisterDto dto);
    Task<LoginResponseDto?> LoginAsync(LoginDto dto);
    Task<IdentityResult> ChangePasswordAsync(int userId, ChangePasswordDto dto);
    Task<string?> GeneratePasswordResetTokenAsync(string email);
    Task<IdentityResult> ResetPasswordAsync(ResetPasswordDto dto);
    Task<IdentityResult> AssignRoleAsync(string email, string roleName);
    Task<IEnumerable<object>> GetAllUsersWithRolesAsync();
}