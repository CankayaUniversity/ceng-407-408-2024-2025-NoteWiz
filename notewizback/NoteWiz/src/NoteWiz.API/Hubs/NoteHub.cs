using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace NoteWiz.API.Hubs
{
    [Authorize]
    public class NoteHub : Hub
    {
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
    }
} 