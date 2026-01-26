using Microsoft.AspNetCore.Identity;
using Practice_team06.Models;

public static class DbInitializer
{
    public static async Task SeedRolesAndAdminAsync(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<User>>();

        // 1. Список необхідних ролей
        string[] roleNames = { "Admin", "Manager", "Customer" };

        foreach (var roleName in roleNames)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole<int>(roleName));
            }
        }

        // 2. Створення головного Адміна (якщо його ще немає)
        var adminEmail = "admin@cinema.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            var admin = new User
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = "System",
                LastName = "Admin",
                BirthDate = new DateTime(2000, 1, 1), 
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(admin, "Admin123!"); // Використовуй складний пароль
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, "Admin");
            }
        }
    }
}