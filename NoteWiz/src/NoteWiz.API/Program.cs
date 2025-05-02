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

var builder = WebApplication.CreateBuilder(args);

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

// Register services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<INoteService, NoteService>();

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
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "DefaultDevKeyForTesting12345678901234567890")),
        ClockSkew = TimeSpan.FromMinutes(1), // 1 dakika tolerans
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

            logger.LogError("Issuer: {Issuer}", builder.Configuration["Jwt:Issuer"]);
            logger.LogError("Audience: {Audience}", builder.Configuration["Jwt:Audience"]);
            logger.LogError("Key: {Key}", builder.Configuration["Jwt:Key"]);
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

            logger.LogWarning("Issuer: {Issuer}", builder.Configuration["Jwt:Issuer"]);
            logger.LogWarning("Audience: {Audience}", builder.Configuration["Jwt:Audience"]);
            return Task.CompletedTask;
        }
    };
});

// Add controllers
builder.Services.AddControllers();

// Add SignalR
builder.Services.AddSignalR();

// Configure CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder
            .WithOrigins("http://localhost:5263", "http://localhost:7226")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .WithExposedHeaders("Authorization")
            .AllowCredentials();
    });

    options.AddPolicy("SignalRPolicy", builder =>
    {
        builder
            .WithOrigins("http://localhost:5263", "http://localhost:7226")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .WithExposedHeaders("Authorization")
            .AllowCredentials()
            .SetIsOriginAllowed(hostName => true);
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
}

app.UseHttpsRedirection();

// Use CORS before authentication
app.UseCors("AllowAll");

// Use authentication and authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Configure SignalR hubs
app.MapHub<NoteHub>("/hubs/notes");
app.MapHub<NotificationHub>("/hubs/notifications");

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
