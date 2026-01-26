using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Practice_team06.Models;

namespace Practice_team06.Data;

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
    public static async Task SeedDataAsync(PostgresContext context)
    {
        // 0. Перевірка, чи база вже має дані (щоб не дублювати)
        if (await context.Genres.AnyAsync()) return;

        // 1. ЖАНРИ
        var action = new Genre { Name = "Бойовик" };
        var sciFi = new Genre { Name = "Фантастика" };
        var drama = new Genre { Name = "Драма" };
        var horror = new Genre { Name = "Жахи" };
        var comedy = new Genre { Name = "Комедія" };
        
        context.Genres.AddRange(action, sciFi, drama, horror, comedy);

        // 2. МОВИ
        var ukrDub = new Language { Name = "Український дубляж" };
        var ukrSub = new Language { Name = "Українські субтитри" };
        var original = new Language { Name = "Англійська (Оригінал)" };
        
        context.Languages.AddRange(ukrDub, ukrSub, original);

        // 3. ЗАЛИ (Halls)
        var hallImax = new Hall 
        { 
            Name = "Зал 1 (IMAX)", 
            PriceModifier = 1.50m, 
            Description = "Величезний екран з ефектом занурення" 
        };
        var hallVip = new Hall 
        { 
            Name = "Зал 2 (VIP)", 
            PriceModifier = 2.00m, 
            Description = "Шкіряні крісла-реклайнери та обслуговування" 
        };
        var hallClassic = new Hall 
        { 
            Name = "Зал 3 (Стандарт)", 
            PriceModifier = 1.00m, 
            Description = "Затишний класичний зал" 
        };
        
        context.Halls.AddRange(hallImax, hallVip, hallClassic);
        await context.SaveChangesAsync(); // Зберігаємо, щоб отримати Id для місць

        // 4. МІСЦЯ (Seats)
        // Генеруємо місця для IMAX (5 рядів по 8 місць)
        for (short r = 1; r <= 5; r++)
        {
            for (short s = 1; s <= 8; s++)
            {
                context.Seats.Add(new Seat
                {
                    HallId = hallImax.Id,
                    RowNumber = r,
                    SeatNumber = s,
                    PriceModifier = r >= 4 ? 1.20m : 1.00m, // Останні ряди трохи дорожчі
                    SeatType = r >= 4 ? SeatType.VIP : SeatType.Standard 
                });
            }
        }

        // 5. РЕЖИСЕРИ (Directors)
        var nolan = new Director { FirstName = "Крістофер", LastName = "Нолан", PhotoUri = "https://images.com/nolan.jpg" };
        var villeneuve = new Director { FirstName = "Дені", LastName = "Вільньов", PhotoUri = "https://images.com/denis.jpg" };
        
        context.Directors.AddRange(nolan, villeneuve);
        await context.SaveChangesAsync();

        // 6. АКТОРИ (Actors)
        var murphy = new Actor { FirstName = "Кілліан", LastName = "Мерфі" };
        var chalamet = new Actor { FirstName = "Тімоті", LastName = "Шаламе" };
        var downey = new Actor { FirstName = "Роберт", LastName = "Дауні-молодший" };
        
        context.Actors.AddRange(murphy, chalamet, downey);
        await context.SaveChangesAsync();

        // 7. ФІЛЬМИ (Movies)
        var oppenheimer = new Movie
        {
            Title = "Оппенгеймер",
            Description = "Історія створення атомної бомби фізиком Робертом Оппенгеймером.",
            DurationMin = 180,
            ReleaseDate = new DateOnly(2023, 7, 21),
            BasePrice = 120.00m,
            StartDate = new DateOnly(2026, 1, 1),
            EndDate = new DateOnly(2026, 3, 1),
            Rating = 8.6m,
            AgeRestriction = AgeRestriction.SixteenPlus, 
            DirectorId = nolan.Id
        };

        var dune = new Movie
        {
            Title = "Дюна: Частина друга",
            Description = "Пол Атрід об'єднується з чані та фріменами, щоб помститися змовникам.",
            DurationMin = 166,
            ReleaseDate = new DateOnly(2024, 2, 28),
            BasePrice = 140.00m,
            StartDate = new DateOnly(2026, 1, 1),
            EndDate = new DateOnly(2026, 4, 1),
            Rating = 8.9m,
            AgeRestriction = AgeRestriction.TwelvePlus, 
            DirectorId = villeneuve.Id
        };

        context.Movies.AddRange(oppenheimer, dune);
        await context.SaveChangesAsync();

        // 8. ЗВ'ЯЗКИ Актори-Фільми (MovieActors)
        context.MovieActors.Add(new MovieActor { MovieId = oppenheimer.Id, ActorId = murphy.Id, RoleName = "Роберт Оппенгеймер" });
        context.MovieActors.Add(new MovieActor { MovieId = oppenheimer.Id, ActorId = downey.Id, RoleName = "Льюїс Штраус" });
        context.MovieActors.Add(new MovieActor { MovieId = dune.Id, ActorId = chalamet.Id, RoleName = "Пол Атрід" });

        // 9. ЗВ'ЯЗКИ Жанри-Фільми (MovieGenres)
        context.MovieGenres.Add(new MovieGenre { MovieId = oppenheimer.Id, GenreId = drama.Id });
        context.MovieGenres.Add(new MovieGenre { MovieId = dune.Id, GenreId = sciFi.Id });

        // 10. СЕАНСИ (Sessions)
        // Створюємо декілька сеансів на вечір
        context.Sessions.AddRange(
            new Session 
            { 
                MovieId = oppenheimer.Id, 
                HallId = hallImax.Id, 
                LanguageId = ukrDub.Id, 
                StartTime = DateTime.SpecifyKind(new DateTime(2026, 2, 1, 19, 0, 0), DateTimeKind.Utc) 
            },
            new Session 
            { 
                MovieId = dune.Id, 
                HallId = hallVip.Id, 
                LanguageId = original.Id, 
                StartTime = DateTime.SpecifyKind(new DateTime(2026, 2, 1, 21, 30, 0), DateTimeKind.Utc) 
            }
        );

        await context.SaveChangesAsync();
    }
}