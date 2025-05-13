using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NoteWiz.Core.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace NoteWiz.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider, ILogger logger)
        {
            try
            {
                using var scope = serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                // Veritabanını oluştur veya var olan veritabanını kullan
                bool wasCreated = await context.Database.EnsureCreatedAsync();
                
                if (wasCreated)
                {
                    logger.LogInformation("Veritabanı başarıyla oluşturuldu.");
                }
                else
                {
                    // Veritabanı zaten vardı
                    logger.LogInformation("Mevcut veritabanı kullanılıyor.");
                    
                    // Veritabanı bağlantısını test et
                    bool canConnect = await context.Database.CanConnectAsync();
                    if (canConnect)
                    {
                        logger.LogInformation("Veritabanına başarıyla bağlanıldı.");
                    }
                    else
                    {
                        logger.LogError("Veritabanına bağlanılamıyor!");
                        return;
                    }
                }

                // Tabloları kontrol et
                try
                {
                    // Users tablosuna erişmeye çalış
                    var userCount = await context.Users.CountAsync();
                    logger.LogInformation($"Kullanıcı sayısı: {userCount}");

                    // Veritabanında hiç kullanıcı yoksa örnek bir admin kullanıcı ekle
                    if (userCount == 0)
                    {
                        logger.LogInformation("Örnek admin kullanıcısı ekleniyor...");
                        var adminUser = new User
                        {
                            Username = "admin",
                            Email = "admin@example.com",
                            FullName = "System Administrator",
                            PasswordHash = "AQAAAAEAACcQAAAAELpkvSezXGrZPrVnOhJbd7LsulzSWBhwpQYVlTBZK98yZEHpewvoKVfrgMG/r9MQgg==", // Password: Admin123!
                            IsAdmin = true,
                            CreatedAt = DateTime.UtcNow
                        };

                        context.Users.Add(adminUser);
                        await context.SaveChangesAsync();
                        logger.LogInformation("Admin kullanıcısı başarıyla eklendi.");
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Tablolara erişilirken hata oluştu.");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Veritabanı başlatılırken bir hata oluştu.");
                throw;
            }
        }
    }
} 