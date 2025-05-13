using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using NoteWiz.Infrastructure.Data;

namespace NoteWiz.Infrastructure.Repositories
{
    public class FriendshipRepository : GenericRepository<Friendship>, IFriendshipRepository
    {
        public FriendshipRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Friendship> GetFriendshipAsync(int userId, int friendId)
        {
            return await _context.Friendships
                .Include(f => f.User)
                .Include(f => f.Friend)
                .FirstOrDefaultAsync(f => (f.UserId == userId && f.FriendId == friendId) ||
                                        (f.UserId == friendId && f.FriendId == userId));
        }

        public async Task<IEnumerable<Friendship>> GetUserFriendshipsAsync(int userId)
        {
            return await _context.Friendships
                .Include(f => f.User)
                .Include(f => f.Friend)
                .Where(f => f.UserId == userId || f.FriendId == userId)
                .ToListAsync();
        }
    }
} 