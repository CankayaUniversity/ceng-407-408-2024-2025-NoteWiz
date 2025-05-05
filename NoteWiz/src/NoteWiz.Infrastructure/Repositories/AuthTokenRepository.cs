using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using NoteWiz.Infrastructure.Data;

namespace NoteWiz.Infrastructure.Repositories
{
    public class AuthTokenRepository : GenericRepository<AuthToken>, IAuthTokenRepository
    {
        public AuthTokenRepository(NoteWizDbContext context) : base(context)
        {
        }

        public async Task<AuthToken> GetValidTokenAsync(string token)
        {
            return await _context.AuthTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == token && !t.IsRevoked && t.ExpiresAt > System.DateTime.UtcNow);
        }

        public async Task<AuthToken> GetUserActiveTokenAsync(int userId)
        {
            return await _context.AuthTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.UserId == userId && !t.IsRevoked && t.ExpiresAt > System.DateTime.UtcNow);
        }
    }
} 