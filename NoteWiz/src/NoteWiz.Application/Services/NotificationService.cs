using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork;

        public NotificationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Notification> GetNotificationByIdAsync(int id)
        {
            return await _unitOfWork.Notifications.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Notification>> GetUserNotificationsAsync(int userId)
        {
            return await _unitOfWork.Notifications.GetUserNotificationsAsync(userId);
        }

        public async Task<IEnumerable<Notification>> GetUnreadNotificationsAsync(int userId)
        {
            return await _unitOfWork.Notifications.GetUnreadNotificationsAsync(userId);
        }

        public async Task<Notification> CreateNotificationAsync(Notification notification)
        {
            await _unitOfWork.Notifications.AddAsync(notification);
            await _unitOfWork.SaveChangesAsync();
            return notification;
        }

        public async Task MarkAsReadAsync(int notificationId)
        {
            await _unitOfWork.Notifications.MarkAsReadAsync(notificationId);
            await _unitOfWork.SaveChangesAsync();
        }
    }
} 