using System.Threading.Tasks;

namespace NoteWiz.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        public async Task SendEmailAsync(string to, string subject, string body)
        {
            // E-posta gönderme işlemi burada yapılacak
        }
    }
} 