using Microsoft.AspNetCore.Identity;
using Practice_team06.DTOs.Auth;
using Practice_team06.DTOs.User;

namespace Practice_team06.Services;

public interface IAuthService
{
    Task<AuthResultDto> RegisterAsync(RegisterDto dto);
    Task<LoginResponseDto?> LoginAsync(LoginDto dto);
    Task<IdentityResult> ChangePasswordAsync(int userId, ChangePasswordDto dto);
    Task<LoginResponseDto?> ChangeEmailAsync(int userId, ChangeEmailDto dto);
    Task<string?> GeneratePasswordResetTokenAsync(string email);
    Task<IdentityResult> ResetPasswordAsync(ResetPasswordDto dto);
    Task<IdentityResult> AssignRoleAsync(string email, string roleName);
    Task<IEnumerable<UserDto>> GetAllUsersWithRolesAsync();
}