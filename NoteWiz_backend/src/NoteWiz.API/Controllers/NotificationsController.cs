using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteWiz.API.Hubs;
using NoteWiz.Core.Interfaces;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace NoteWiz.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationsController(
            INotificationService notificationService,
            IHubContext<NotificationHub> hubContext)
        {
            _notificationService = notificationService;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserNotifications([FromQuery] bool includeRead = false)
        {
            var userId = int.Parse(User.FindFirst("userId").Value);
            var notifications = await _notificationService.GetUserNotificationsAsync(userId, includeRead);
            return Ok(notifications);
        }

        [HttpGet("unread")]
        public async Task<IActionResult> GetUnreadNotifications()
        {
            var userId = int.Parse(User.FindFirst("userId").Value);
            var notifications = await _notificationService.GetUnreadNotificationsAsync(userId);
            return Ok(notifications);
        }

        [HttpGet("unread/count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = int.Parse(User.FindFirst("userId").Value);
            var count = await _notificationService.GetUnreadCountAsync(userId);
            return Ok(new { count });
        }

        [HttpPost("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notification = await _notificationService.MarkAsReadAsync(id);
            if (notification == null)
                return NotFound();

            return Ok(notification);
        }

        [HttpPost("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = int.Parse(User.FindFirst("userId").Value);
            var success = await _notificationService.MarkAllAsReadForUserAsync(userId);
            return Ok(new { success });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _notificationService.DeleteAsync(id);
            if (!success)
                return NotFound();

            return Ok(new { success });
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteAll()
        {
            var userId = int.Parse(User.FindFirst("userId").Value);
            var success = await _notificationService.DeleteAllForUserAsync(userId);
            return Ok(new { success });
        }

        [HttpPost("send")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SendNotification([FromBody] SendNotificationRequest request)
        {
            var notification = await _notificationService.CreateAsync(
                request.UserId,
                request.Title,
                request.Message,
                request.NoteId,
                request.TaskId
            );

            await _hubContext.Clients.Group($"User_{request.UserId}")
                .SendAsync("ReceiveNotification", notification);

            return Ok(notification);
        }
    }

    public class SendNotificationRequest
    {
        public int UserId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public int? NoteId { get; set; }
        public int? TaskId { get; set; }
    }
} 