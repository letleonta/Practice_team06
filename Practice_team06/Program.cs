using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Practice_team06.Models;
using Practice_team06.Services;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<PostgresContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddIdentity<User, IdentityRole<int>>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequireUppercase = true;
        options.Password.RequiredLength = 6;
        options.Password.RequiredUniqueChars = 1;
        
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.AllowedForNewUsers = true;
        
        options.User.AllowedUserNameCharacters =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
        options.User.RequireUniqueEmail = false;
    })
    .AddEntityFrameworkStores<PostgresContext>()
    .AddDefaultTokenProviders();

builder.Services.AddScoped<IActorService, ActorService>();
builder.Services.AddScoped<IDirectorService, DirectorService>();

builder.Services.AddScoped<ISeatService, SeatService>();
builder.Services.AddScoped<IHallService, HallService>();

builder.Services.AddScoped<BookingService>();
builder.Services.AddScoped<TicketService>();

builder.Services.AddScoped<IGenreService, GenreService>();
builder.Services.AddScoped<ILanguageService, LanguageService>();

builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<IMovieService, MovieService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

    var user1 = new User
    {
        UserName = "alice",
        NormalizedUserName = "ALICE",
        Email = "alice@example.com",
        NormalizedEmail = "ALICE@EXAMPLE.COM",
        EmailConfirmed = true,
        FirstName = "Alice",
        LastName = "Smith",
        BirthDate = new DateTime(1995, 5, 1),
        PhoneNumber = "1234567890",
        PhoneNumberConfirmed = true
    };

    var user2 = new User
    {
        UserName = "bob",
        NormalizedUserName = "BOB",
        Email = "bob@example.com",
        NormalizedEmail = "BOB@EXAMPLE.COM",
        EmailConfirmed = true,
        FirstName = "Bob",
        LastName = "Johnson",
        BirthDate = new DateTime(1990, 3, 15),
        PhoneNumber = "0987654321",
        PhoneNumberConfirmed = true
    };

    await userManager.CreateAsync(user1, "Password123!");
    await userManager.CreateAsync(user2, "Password123!");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await DbInitializer.SeedRolesAndAdminAsync(services);
}

app.MapControllers();

app.Run();