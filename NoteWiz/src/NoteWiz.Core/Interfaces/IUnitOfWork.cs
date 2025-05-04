using System.Threading.Tasks;

namespace NoteWiz.Core.Interfaces
{
    public interface IUnitOfWork
    {
        IUserRepository Users { get; }
        INoteRepository Notes { get; }
        ITaskRepository Tasks { get; }
        IDocumentUploadRepository DocumentUploads { get; }
        IAuthTokenRepository AuthTokens { get; }
        IUserDeviceRepository UserDevices { get; }
        INotificationRepository Notifications { get; }
        IFriendshipRepository Friendships { get; }
        IFriendshipRequestRepository FriendshipRequests { get; }
        INoteShareRepository NoteShares { get; }

        Task<int> SaveChangesAsync();
    }
} 