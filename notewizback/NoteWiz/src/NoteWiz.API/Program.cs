using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NoteWiz.API.Hubs;
using NoteWiz.Core.Interfaces;
using NoteWiz.Infrastructure.Data;
using NoteWiz.Infrastructure.Repositories;
using NoteWiz.Infrastructure.Services;
using NoteWiz.Application.Services;
using System.Reflection;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using NoteWiz.Core.Entities;
using NoteWiz.API.Middleware;
using Microsoft.Extensions.Configuration;
using AutoMapper;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(envPath))
{
    foreach (var line in File.ReadAllLines(envPath))
    {
        var parts = line.Split('=', 2);
        if (parts.Length == 2 && !line.StartsWith("#"))
        {
            Environment.SetEnvironmentVariable(parts[0].Trim(), parts[1].Trim());
        }
    }
}

// Kestrel sunucusunu yapılandır
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5263);
});

// Loglama servislerini ekle
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Add services to the container.
// Configure database connection
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    // Bağlantı dizesini al
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    var sqlAuthConnectionString = builder.Configuration.GetConnectionString("SqlAuthentication");
    
    // Bağlantı dizesini loglama - BuildServiceProvider kullanmadan
    Console.WriteLine($"Windows Authentication bağlantı dizesi: {connectionString}");
    Console.WriteLine($"SQL Server Authentication bağlantı dizesi: {sqlAuthConnectionString}");
    
    // Önce Windows Auth ile dene, hata alırsa SQL Auth'a geç
    try
    {
        // SQL Server'a bağlan
        options.UseSqlServer(connectionString, sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        });
        
        Console.WriteLine("Windows Authentication bağlantısı yapılandırıldı");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Windows Authentication ile bağlantı kurulamadı, SQL Authentication deneniyor... Hata: {ex.Message}");
        
        // SQL Auth ile dene
        options.UseSqlServer(sqlAuthConnectionString, sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        });
        
        Console.WriteLine("SQL Server Authentication bağlantısı yapılandırıldı");
    }
    
    // Detaylı hata mesajlarını etkinleştir (sadece geliştirme ortamında)
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});

// Register NoteWizDbContext
builder.Services.AddDbContext<NoteWizDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    var sqlAuthConnectionString = builder.Configuration.GetConnectionString("SqlAuthentication");
    
    try
    {
        options.UseSqlServer(connectionString, sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        });
    }
    catch
    {
        options.UseSqlServer(sqlAuthConnectionString, sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        });
    }
    
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});

// Register repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<INoteRepository, NoteRepository>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<IAuthTokenRepository, AuthTokenRepository>();
builder.Services.AddScoped<IUserDeviceRepository, UserDeviceRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IFriendshipRepository, FriendshipRepository>();
builder.Services.AddScoped<IFriendshipRequestRepository, FriendshipRequestRepository>();
builder.Services.AddScoped<INoteShareRepository, NoteShareRepository>();
builder.Services.AddScoped<IRepository<AIInteractionLog>, AIInteractionLogRepository>();
builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();

// Register UnitOfWork
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Register services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<INoteService, NoteService>();
builder.Services.AddScoped<IFriendshipService, FriendshipService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IAIService, DeepSeekAIService>();
builder.Services.AddScoped<IDrawingService, DrawingService>();
builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddScoped<NoteShareService>(sp => 
{
    var noteShareRepository = sp.GetRequiredService<INoteShareRepository>();
    var noteRepository = sp.GetRequiredService<INoteRepository>();
    var userRepository = sp.GetRequiredService<IUserRepository>();
    var baseUrl = builder.Configuration["AppSettings:BaseUrl"] ?? "http://localhost:3000";
    return new NoteShareService(noteShareRepository, noteRepository, userRepository, baseUrl);
});
builder.Services.AddHttpClient<IAIService, DeepSeekAIService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// Add memory cache for rate limiting
builder.Services.AddMemoryCache();

// Add JWT Authentication
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
        ValidIssuer = builder.Configuration["AppSettings:JWT:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["AppSettings:JWT:Audience"],
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:JWT:SecretKey"] ?? "DefaultDevKeyForTesting12345678901234567890")),
        ClockSkew = TimeSpan.FromMinutes(1),
        RequireExpirationTime = true,
        RequireSignedTokens = true,
        SaveSigninToken = true
    };

    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.IncludeErrorDetails = true;

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];

            // If the request is for our hub...
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/hubs/notes") || path.StartsWithSegments("/hubs/notifications")))
            {
                // Read the token out of the query string
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        },
        OnAuthenticationFailed = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError("Authentication failed: {Exception}", context.Exception);
            
            // Token header kontrolü
            var authHeader = context.Request.Headers["Authorization"].ToString();
            logger.LogError("Authorization Header: {Header}", authHeader);
            
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
            {
                var token = authHeader.Substring("Bearer ".Length).Trim();
                logger.LogError("Extracted Token: {Token}", token);
            }
            else
            {
                logger.LogError("Invalid Authorization header format");
            }

            logger.LogError("Issuer: {Issuer}", builder.Configuration["AppSettings:JWT:Issuer"]);
            logger.LogError("Audience: {Audience}", builder.Configuration["AppSettings:JWT:Audience"]);
            logger.LogError("Key: {Key}", builder.Configuration["AppSettings:JWT:SecretKey"]);
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogInformation("Token validated successfully");
            if (context.SecurityToken is JwtSecurityToken jwtToken)
            {
                logger.LogInformation("Issuer: {Issuer}", jwtToken.Issuer);
                logger.LogInformation("Audience: {Audience}", jwtToken.Audiences.FirstOrDefault());
            }
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogWarning("Authentication challenge triggered: {Error}", context.Error);
            
            // Token header kontrolü
            var authHeader = context.Request.Headers["Authorization"].ToString();
            logger.LogWarning("Authorization Header: {Header}", authHeader);
            
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
            {
                var token = authHeader.Substring("Bearer ".Length).Trim();
                logger.LogWarning("Extracted Token: {Token}", token);
            }
            else
            {
                logger.LogWarning("Invalid Authorization header format");
            }

            logger.LogWarning("Issuer: {Issuer}", builder.Configuration["AppSettings:JWT:Issuer"]);
            logger.LogWarning("Audience: {Audience}", builder.Configuration["AppSettings:JWT:Audience"]);
            return Task.CompletedTask;
        }
    };
});

// Add controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Add SignalR
builder.Services.AddSignalR();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "NoteWiz API", 
        Version = "v1",
        Description = "API for NoteWiz - an AI-powered note-taking application"
    });

    // Include XML comments
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }

    // Configure Swagger to use JWT Authentication
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
    
    // Hide schemas that aren't needed in the API documentation
    c.SchemaFilter<SwaggerSchemaFilter>();
});

builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// Veritabanını başlat
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        logger.LogInformation("Veritabanı başlatılıyor...");
        await DbInitializer.InitializeAsync(app.Services, logger);
        logger.LogInformation("Veritabanı başlatma işlemi tamamlandı.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Veritabanı başlatılırken bir hata oluştu.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // Remove HTTPS redirection in development
    app.UseHttpsRedirection();
}

// Use CORS
app.UseCors();

// Use authentication and authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Configure SignalR hubs
app.MapHub<NoteHub>("/hubs/notes");
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapHub<AIHub>("/hubs/ai");

// Add AI rate limiting middleware
app.UseMiddleware<AIRateLimitingMiddleware>();

app.Run();

// Custom schema filter to hide unwanted models in Swagger UI
public class SwaggerSchemaFilter : Swashbuckle.AspNetCore.SwaggerGen.ISchemaFilter
{
    public void Apply(OpenApiSchema schema, Swashbuckle.AspNetCore.SwaggerGen.SchemaFilterContext context)
    {
        // Hide entity models that have corresponding DTOs
        var typesToHide = new[]
        {
            typeof(NoteWiz.Core.Entities.User),
            typeof(NoteWiz.Core.Entities.Note),
            typeof(NoteWiz.Core.Entities.NoteShare)
        };

        if (typesToHide.Contains(context.Type))
        {
            schema.Properties.Clear();
            schema.Type = "object";
            schema.Description = $"This type is not directly exposed by the API. Use the corresponding DTO instead.";
        }
    }
}

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
