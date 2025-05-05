using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using System.Threading.Tasks;

namespace NoteWiz.API.Hubs
{
    [Authorize]
    public class NoteHub : Hub
    {
        private readonly INotificationService _notificationService;

        public NoteHub(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.GetHttpContext()?.User?.FindFirst("userId")?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = Context.GetHttpContext()?.User?.FindFirst("userId")?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userId}");
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinNoteSession(int noteId)
        {
            var userName = Context.User?.Identity?.Name ?? "Anonymous";
            await Groups.AddToGroupAsync(Context.ConnectionId, $"note_{noteId}");
            await Clients.Group($"note_{noteId}").SendAsync("UserJoined", userName);
        }

        public async Task LeaveNoteSession(int noteId)
        {
            var userName = Context.User?.Identity?.Name ?? "Anonymous";
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"note_{noteId}");
            await Clients.Group($"note_{noteId}").SendAsync("UserLeft", userName);
        }

        public async Task UpdateNote(int noteId, string content)
        {
            if (string.IsNullOrEmpty(content))
            {
                throw new ArgumentNullException(nameof(content));
            }
            await Clients.OthersInGroup($"note_{noteId}").SendAsync("NoteUpdated", content);
        }

        public async Task AddDrawing(int noteId, string drawingData)
        {
            if (string.IsNullOrEmpty(drawingData))
            {
                throw new ArgumentNullException(nameof(drawingData));
            }
            await Clients.OthersInGroup($"note_{noteId}").SendAsync("DrawingAdded", drawingData);
        }

        public async Task UserIsTyping(int noteId, string userName)
        {
            if (string.IsNullOrEmpty(userName))
            {
                userName = Context.User?.Identity?.Name ?? "Anonymous";
            }
            await Clients.OthersInGroup($"note_{noteId}").SendAsync("UserTyping", userName);
        }

        public async Task SendNotification(int userId, string title, string message)
        {
            await Clients.Group($"User_{userId}").SendAsync("ReceiveNotification", title, message);
        }

        public async Task SendTaskReminder(int userId, int taskId, string taskTitle)
        {
            await Clients.Group($"User_{userId}").SendAsync("ReceiveTaskReminder", taskId, taskTitle);
        }

        public async Task SendNoteShared(int userId, int noteId, string noteTitle, string sharedByUsername)
        {
            await Clients.Group($"User_{userId}").SendAsync("ReceiveNoteShared", noteId, noteTitle, sharedByUsername);
        }

        public async Task MarkNotificationAsRead(int notificationId)
        {
            await _notificationService.MarkAsReadAsync(notificationId);
        }
    }
} 