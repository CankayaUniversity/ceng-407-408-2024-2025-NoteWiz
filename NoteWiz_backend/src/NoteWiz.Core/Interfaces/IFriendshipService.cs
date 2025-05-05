using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    public interface IFriendshipService
    {
        Task<Friendship> SendFriendRequestAsync(int userId, int friendId);
        Task<Friendship> AcceptFriendRequestAsync(int requestId, int userId);
        Task<bool> RejectFriendRequestAsync(int requestId, int userId);
        Task<IEnumerable<Friendship>> GetFriendRequestsAsync(int userId);
        Task<IEnumerable<Friendship>> GetFriendsAsync(int userId);
        Task<bool> RemoveFriendAsync(int userId, int friendId);
    }
} 