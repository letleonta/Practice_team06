using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Practice_team06.Data;
using Practice_team06.Mappings;
using Practice_team06.Models;
using Practice_team06.Services;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

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
        
        options.User.RequireUniqueEmail = false;
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
        options.Lockout.MaxFailedAccessAttempts = 5;
    })
    .AddEntityFrameworkStores<PostgresContext>()
    .AddDefaultTokenProviders();

var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? "SuperSecretDefaultKey_32CharactersLong");

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") 
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddAutoMapper(_ => {}, typeof(ActorProfile).Assembly);
builder.Services.AddAutoMapper(_ => {}, typeof(DirectorProfile).Assembly);

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IActorService, ActorService>();
builder.Services.AddScoped<IDirectorService, DirectorService>();
builder.Services.AddScoped<ISeatService, SeatService>();
builder.Services.AddScoped<IHallService, HallService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<IGenreService, GenreService>();
builder.Services.AddScoped<ILanguageService, LanguageService>();
builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<IMovieService, MovieService>();
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<PostgresContext>();
        var userManager = services.GetRequiredService<UserManager<User>>();
        
        await DbInitializer.SeedRolesAndAdminAsync(services);
        
        if (!await userManager.Users.AnyAsync(u => u.Email == "alice@example.com"))
        {
            var user1 = new User
            {
                UserName = "alice@example.com",
                Email = "alice@example.com",
                FirstName = "Alice",
                LastName = "Smith",
                BirthDate = new DateTime(1995, 5, 1), 
                EmailConfirmed = true
            };

            var user2 = new User
            {
                UserName = "bob@example.com",
                Email = "bob@example.com",
                FirstName = "Bob",
                LastName = "Johnson",
                BirthDate = new DateTime(1990, 3, 15),
                EmailConfirmed = true
            };
            
            var result1 = await userManager.CreateAsync(user1, "Password123!");
            if (result1.Succeeded) await userManager.AddToRoleAsync(user1, "Customer");
            
            var result2 = await userManager.CreateAsync(user2, "Password123!");
            if (result2.Succeeded) await userManager.AddToRoleAsync(user2, "Customer");
            
            Console.WriteLine("Тестові користувачі Alice та Bob успішно додані.");
        }
        
        await DbInitializer.SeedDataAsync(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Помилка під час ініціалізації бази.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting(); 

app.UseCors("AllowReactApp"); 

app.UseAuthentication(); 
app.UseAuthorization();  

app.MapControllers();

app.Run();