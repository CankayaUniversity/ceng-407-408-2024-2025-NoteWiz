using System.Threading.Tasks;
using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    public interface IUnitOfWork
    {
        IUserRepository Users { get; }
        INoteRepository Notes { get; }
        ITaskRepository Tasks { get; }
        IAuthTokenRepository AuthTokens { get; }
        IUserDeviceRepository UserDevices { get; }
        INotificationRepository Notifications { get; }
        IFriendshipRepository Friendships { get; }
        IFriendshipRequestRepository FriendshipRequests { get; }
        INoteShareRepository NoteShares { get; }
        IRepository<AIInteractionLog> AIInteractionLogs { get; }
        IDocumentRepository Documents { get; }

        Task<int> SaveChangesAsync();
    }
} 