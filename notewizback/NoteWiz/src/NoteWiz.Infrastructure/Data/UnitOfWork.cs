using NoteWiz.Core.Interfaces;
using NoteWiz.Infrastructure.Data;
using NoteWiz.Infrastructure.Repositories;
using NoteWiz.Core.Entities;

namespace NoteWiz.Infrastructure.Data
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly NoteWizDbContext _context;
        private IUserRepository _users;
        private INoteRepository _notes;
        private ITaskRepository _tasks;
        private IAuthTokenRepository _authTokens;
        private IUserDeviceRepository _userDevices;
        private INotificationRepository _notifications;
        private IFriendshipRepository _friendships;
        private IFriendshipRequestRepository _friendshipRequests;
        private INoteShareRepository _noteShares;
        private IRepository<AIInteractionLog> _aiInteractionLogs;
        private IDocumentRepository _documents;

        public UnitOfWork(NoteWizDbContext context)
        {
            _context = context;
        }

        public IUserRepository Users => _users ??= new UserRepository(_context);
        public INoteRepository Notes => _notes ??= new NoteRepository(_context);
        public ITaskRepository Tasks => _tasks ??= new TaskRepository(_context);
        public IAuthTokenRepository AuthTokens => _authTokens ??= new AuthTokenRepository(_context);
        public IUserDeviceRepository UserDevices => _userDevices ??= new UserDeviceRepository(_context);
        public INotificationRepository Notifications => _notifications ??= new NotificationRepository(_context);
        public IFriendshipRepository Friendships => _friendships ??= new FriendshipRepository(_context);
        public IFriendshipRequestRepository FriendshipRequests => _friendshipRequests ??= new FriendshipRequestRepository(_context);
        public INoteShareRepository NoteShares => _noteShares ??= new NoteShareRepository(_context);
        public IRepository<AIInteractionLog> AIInteractionLogs => _aiInteractionLogs ??= new AIInteractionLogRepository(_context);
        public IDocumentRepository Documents => _documents ??= new DocumentRepository(_context);

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
} 