using System.Text.Json.Serialization;
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
        options.Password.RequireDigit = false;
        options.Password.RequiredLength = 6;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<PostgresContext>()
    .AddDefaultTokenProviders();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddScoped<ISeatService, SeatService>();

builder.Services.AddScoped<IHallService, HallService>();

builder.Services.AddScoped<BookingService>();
builder.Services.AddScoped<TicketService>();

builder.Services.AddScoped<IGenreService, GenreService>();
builder.Services.AddScoped<ILanguageService, LanguageService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<IMovieService, MovieService>();
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


app.MapControllers();

app.Run();