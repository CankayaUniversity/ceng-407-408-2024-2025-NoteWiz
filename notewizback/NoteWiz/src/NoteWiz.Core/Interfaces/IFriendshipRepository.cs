using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    public interface IFriendshipRepository : IGenericRepository<Friendship>
    {
        Task<Friendship> GetFriendshipAsync(int userId, int friendId);
        Task<IEnumerable<Friendship>> GetUserFriendshipsAsync(int userId);
    }
} 