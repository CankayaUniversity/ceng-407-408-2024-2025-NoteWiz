using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using NoteWiz.Infrastructure.Data;

namespace NoteWiz.Infrastructure.Repositories
{
    public class FriendshipRequestRepository : GenericRepository<FriendshipRequest>, IFriendshipRequestRepository
    {
        public FriendshipRequestRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<FriendshipRequest>> GetFriendRequestsAsync(int userId)
        {
            return await _context.FriendshipRequests
                .Include(r => r.Sender)
                .Include(r => r.Receiver)
                .Where(r => r.ReceiverId == userId || r.SenderId == userId)
                .ToListAsync();
        }

        public async Task<FriendshipRequest> GetPendingRequestAsync(int senderId, int receiverId)
        {
            return await _context.FriendshipRequests
                .FirstOrDefaultAsync(r => r.Status == FriendshipRequestStatus.Pending &&
                                        ((r.SenderId == senderId && r.ReceiverId == receiverId) ||
                                         (r.SenderId == receiverId && r.ReceiverId == senderId)));
        }
    }
} 