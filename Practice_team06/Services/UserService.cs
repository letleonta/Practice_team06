using Microsoft.AspNetCore.Identity;
using Practice_team06.Models;

namespace Practice_team06.Services;

public class UserService : IUserService
{
    private readonly UserManager<User> _userManager;
    private readonly IWebHostEnvironment _environment;

    public UserService(UserManager<User> userManager, IWebHostEnvironment environment)
    {
        _userManager = userManager;
        _environment = environment; 
    }

    public async Task<string> UploadAvatarAsync(int userId, IFormFile file)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) throw new Exception("Користувача не знайдено");
        
        var extension = Path.GetExtension(file.FileName).ToLower();
        
        if (!string.IsNullOrEmpty(user.AvatarUrl))
        {
            var oldFilePath = Path.Combine(_environment.WebRootPath, user.AvatarUrl.TrimStart('/'));
            if (File.Exists(oldFilePath))
            {
                File.Delete(oldFilePath);
            }
        }
        
        var folderName = Path.Combine("uploads", "avatars");
        var pathToSave = Path.Combine(_environment.WebRootPath, folderName);
        if (!Directory.Exists(pathToSave)) Directory.CreateDirectory(pathToSave);

        var fileName = $"{Guid.NewGuid()}{extension}";
        var dbPath = $"/uploads/avatars/{fileName}";
        var fullPath = Path.Combine(pathToSave, fileName);

        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }
        
        user.AvatarUrl = dbPath;
        await _userManager.UpdateAsync(user);

        return dbPath;
    }
}