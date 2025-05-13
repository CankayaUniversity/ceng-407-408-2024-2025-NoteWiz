using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    public interface IFriendshipService
    {
        Task<Friendship> GetFriendshipAsync(int userId, int friendId);
        Task<IEnumerable<Friendship>> GetUserFriendshipsAsync(int userId);
        Task<FriendshipRequest> GetFriendRequestByIdAsync(int id);
        Task<IEnumerable<FriendshipRequest>> GetFriendRequestsAsync(int userId);
        Task<FriendshipRequest> SendFriendRequestAsync(int senderId, int receiverId);
        Task RespondToFriendRequestAsync(FriendshipRequest request, string status);
        Task RemoveFriendshipAsync(Friendship friendship);
        Task<bool> AreUsersFriendsAsync(int userId1, int userId2);
    }
} 