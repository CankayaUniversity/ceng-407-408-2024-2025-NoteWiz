using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    public interface IFriendshipRequestRepository : IGenericRepository<FriendshipRequest>
    {
        Task<IEnumerable<FriendshipRequest>> GetFriendRequestsAsync(int userId);
        Task<FriendshipRequest> GetPendingRequestAsync(int senderId, int receiverId);
    }
} 