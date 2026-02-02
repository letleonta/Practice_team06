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

            var result = await userManager.CreateAsync(admin, "Admin123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, "Manager");
            }
        }
    }
   public static async Task SeedDataAsync(PostgresContext context)
{
    
    if (await context.Movies.AnyAsync()) return;

    // 1. ЖАНРИ (Додаємо, якщо їх ще нема)
    var genres = new List<Genre>();
    if (!await context.Genres.AnyAsync())
    {
        genres.AddRange(new[] {
            new Genre { Name = "Бойовик" },
            new Genre { Name = "Фантастика" },
            new Genre { Name = "Драма" },
            new Genre { Name = "Жахи" },
            new Genre { Name = "Комедія" }
        });
        context.Genres.AddRange(genres);
        await context.SaveChangesAsync();
    }
    else
    {
        genres = await context.Genres.ToListAsync();
    }

    // 2. МОВИ
    var languages = new List<Language>();
    if (!await context.Languages.AnyAsync())
    {
        languages.AddRange(new[] {
            new Language { Name = "Український дубляж" },
            new Language { Name = "Українські субтитри" },
            new Language { Name = "Англійська (Оригінал)" }
        });
        context.Languages.AddRange(languages);
        await context.SaveChangesAsync();
    }
    else
    {
        languages = await context.Languages.ToListAsync();
    }

    // 3. ЗАЛИ ТА МІСЦЯ
    var hallImax = new Hall { Name = "Зал 1 (IMAX)", PriceModifier = 1.50m, Description = "Величезний екран" };
    var hallVip = new Hall { Name = "Зал 2 (VIP)", PriceModifier = 2.00m, Description = "Крісла-реклайнери" };
    context.Halls.AddRange(hallImax, hallVip);
    await context.SaveChangesAsync();

    for (short r = 1; r <= 5; r++) {
        for (short s = 1; s <= 8; s++) {
            context.Seats.Add(new Seat {
                HallId = hallImax.Id, RowNumber = r, SeatNumber = s,
                PriceModifier = r >= 4 ? 1.20m : 1.00m,
                SeatType = r >= 4 ? SeatType.VIP : SeatType.Standard
            });
        }
    }

    // 4. РЕЖИСЕРИ ТА АКТОРИ
    var nolan = new Director { FirstName = "Крістофер", LastName = "Нолан" };
    var villeneuve = new Director { FirstName = "Дені", LastName = "Вільньов" };
    context.Directors.AddRange(nolan, villeneuve);

    var murphy = new Actor { FirstName = "Кілліан", LastName = "Мерфі" };
    var chalamet = new Actor { FirstName = "Тімоті", LastName = "Шаламе" };
    context.Actors.AddRange(murphy, chalamet);
    
    await context.SaveChangesAsync(); // Зберігаємо, щоб отримати ID для фільмів

    // 5. ФІЛЬМИ
    var oppenheimer = new Movie {
        Title = "Оппенгеймер",
        Description = "Історія створення атомної бомби",
        DurationMin = 180,
        ReleaseDate = new DateOnly(2023, 7, 21),
        BasePrice = 120.00m,
        StartDate = new DateOnly(2026, 1, 1),
        EndDate = new DateOnly(2026, 3, 1),
        Rating = 8.6m,
        PosterUri = "https://promopuff.com.ua/catalog/wp-content/uploads/2024/04/1_0021_sloi-40.jpg",
        TrailerUri = "https://youtu.be/DtR76pz517E?si=vw4dJ8D9Za9cX_jr",
        AgeRestriction = AgeRestriction.SixteenPlus, 
        DirectorId = nolan.Id
    };

    var dune = new Movie {
        Title = "Дюна: Частина друга",
        Description = "Пол Атрід об'єднується з фріменами",
        DurationMin = 166,
        ReleaseDate = new DateOnly(2024, 2, 28),
        BasePrice = 140.00m,
        StartDate = new DateOnly(2026, 1, 1),
        EndDate = new DateOnly(2026, 4, 1),
        Rating = 8.9m,
        PosterUri = "https://upload.wikimedia.org/wikipedia/ru/6/61/%D0%94%D1%8E%D0%BD%D0%B0_%E2%80%94_%D0%A7%D0%B0%D1%81%D1%82%D1%8C_%D0%B2%D1%82%D0%BE%D1%80%D0%B0%D1%8F_%28%D0%BF%D0%BE%D1%81%D1%82%D0%B5%D1%80%29.jpg",
        TrailerUri = "https://youtu.be/DtR76pz517E?si=vw4dJ8D9Za9cX_jr",
        AgeRestriction = AgeRestriction.TwelvePlus, 
        DirectorId = villeneuve.Id
    };

    context.Movies.AddRange(oppenheimer, dune);
    await context.SaveChangesAsync(); // ВАЖЛИВО: Отримуємо ID фільмів перед створенням зв'язків

    // 6. ЗВ'ЯЗКИ (MovieActors та MovieGenres)
    // Використовуємо змінні об'єктів для надійності
    context.MovieActors.AddRange(
        new MovieActor { MovieId = oppenheimer.Id, ActorId = murphy.Id, RoleName = "Роберт Оппенгеймер" },
        new MovieActor { MovieId = dune.Id, ActorId = chalamet.Id, RoleName = "Пол Атрід" }
    );

    var drama = genres.FirstOrDefault(g => g.Name == "Драма");
    var sciFi = genres.FirstOrDefault(g => g.Name == "Фантастика");

    if (drama != null) context.MovieGenres.Add(new MovieGenre { MovieId = oppenheimer.Id, GenreId = drama.Id });
    if (sciFi != null) context.MovieGenres.Add(new MovieGenre { MovieId = dune.Id, GenreId = sciFi.Id });

    // 7. СЕАНСИ
    context.Sessions.AddRange(
        new Session { MovieId = oppenheimer.Id, HallId = hallImax.Id, LanguageId = languages.First().Id, 
            StartTime = new DateTime(2026, 2, 1, 19, 0, 0, DateTimeKind.Unspecified) },
        new Session { MovieId = dune.Id, HallId = hallVip.Id, LanguageId = languages.First().Id, 
            StartTime = new DateTime(2026, 2, 1, 21, 30, 0, DateTimeKind.Unspecified) }
    );

    await context.SaveChangesAsync(); // Фінальне збереження всього
}
}