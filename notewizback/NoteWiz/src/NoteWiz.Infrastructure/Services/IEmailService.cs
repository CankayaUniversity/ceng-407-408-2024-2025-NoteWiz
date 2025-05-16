using System.Threading.Tasks;

namespace NoteWiz.Infrastructure.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
    }
} 