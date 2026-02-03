namespace Practice_team06.Services;

public interface IUserService
{
    Task<string> UploadAvatarAsync(int userId, IFormFile file);
    Task DeleteAvatarAsync(int userId);
}