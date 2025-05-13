using System.Threading.Tasks;
using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    public interface IAuthTokenRepository : IGenericRepository<AuthToken>
    {
        Task<AuthToken> GetValidTokenAsync(string token);
        Task<AuthToken> GetUserActiveTokenAsync(int userId);
    }
} 