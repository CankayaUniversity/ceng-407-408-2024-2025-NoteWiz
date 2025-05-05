using NoteWiz.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoteWiz.Core.Interfaces
{
    public interface INotificationService
    {
        Task<Notification> CreateAsync(int userId, string title, string message, int? noteId = null, int? taskId = null);
        Task<IEnumerable<Notification>> GetUserNotificationsAsync(int userId, bool includeRead = false);
        Task<Notification> MarkAsReadAsync(int notificationId);
        Task<bool> DeleteAsync(int notificationId);
        Task<IEnumerable<Notification>> GetUnreadNotificationsAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);
        Task<bool> DeleteAllForUserAsync(int userId);
        Task<bool> MarkAllAsReadForUserAsync(int userId);
    }
} 