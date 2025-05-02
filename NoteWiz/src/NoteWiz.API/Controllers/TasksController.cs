using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using NoteWiz.API.DTOs;
using NoteWiz.API.Hubs;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using System.Security.Claims;

namespace NoteWiz.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly IRepository<TaskItem> _taskRepository;
        private readonly IHubContext<NotificationHub> _notificationHubContext;

        public TasksController(
            IRepository<TaskItem> taskRepository,
            IHubContext<NotificationHub> notificationHubContext)
        {
            _taskRepository = taskRepository;
            _notificationHubContext = notificationHubContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskResponseDTO>>> GetAll()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            int userId = int.Parse(userIdClaim.Value);
            
            var tasks = await _taskRepository.FindAsync(t => t.UserId == userId);
            var taskDtos = tasks.Select(t => new TaskResponseDTO
            {
                Id = t.Id,
                Description = t.Description,
                DueDate = t.DueDate,
                Priority = t.Priority,
                Reminder = t.Reminder,
                IsCompleted = t.IsCompleted,
                UserId = t.UserId,
                CreatedAt = t.CreatedAt,
                CompletedAt = t.CompletedAt
            });
            return Ok(taskDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskResponseDTO>> GetById(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            int userId = int.Parse(userIdClaim.Value);
            
            var task = await _taskRepository.GetByIdAsync(id);
            
            if (task == null)
            {
                return NotFound();
            }

            if (task.UserId != userId)
            {
                return Forbid();
            }
            
            var taskDto = new TaskResponseDTO
            {
                Id = task.Id,
                Description = task.Description,
                DueDate = task.DueDate,
                Priority = task.Priority,
                Reminder = task.Reminder,
                IsCompleted = task.IsCompleted,
                UserId = task.UserId,
                CreatedAt = task.CreatedAt,
                CompletedAt = task.CompletedAt
            };
            
            return Ok(taskDto);
        }

        [HttpPost]
        public async Task<ActionResult<TaskResponseDTO>> Create([FromBody] CreateTaskDTO dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            int userId = int.Parse(userIdClaim.Value);
            
            var task = new TaskItem
            {
                Description = dto.Description,
                DueDate = dto.DueDate,
                Priority = dto.Priority,
                Reminder = dto.Reminder,
                IsCompleted = dto.IsCompleted,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };
            
            var createdTask = await _taskRepository.AddAsync(task);
            
            var responseDto = new TaskResponseDTO
            {
                Id = createdTask.Id,
                Description = createdTask.Description,
                DueDate = createdTask.DueDate,
                Priority = createdTask.Priority,
                Reminder = createdTask.Reminder,
                IsCompleted = createdTask.IsCompleted,
                UserId = createdTask.UserId,
                CreatedAt = createdTask.CreatedAt,
                CompletedAt = createdTask.CompletedAt
            };
            
            return CreatedAtAction(nameof(GetById), new { id = responseDto.Id }, responseDto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<TaskResponseDTO>> Update(int id, [FromBody] UpdateTaskDTO dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            int userId = int.Parse(userIdClaim.Value);
            
            var existingTask = await _taskRepository.GetByIdAsync(id);
            
            if (existingTask == null)
            {
                return NotFound();
            }

            if (existingTask.UserId != userId)
            {
                return Forbid();
            }

            existingTask.Description = dto.Description;
            existingTask.DueDate = dto.DueDate;
            existingTask.Priority = dto.Priority;
            existingTask.Reminder = dto.Reminder;
            existingTask.IsCompleted = dto.IsCompleted;
            
            if (dto.IsCompleted && !existingTask.CompletedAt.HasValue)
            {
                existingTask.CompletedAt = DateTime.UtcNow;
            }
            else if (!dto.IsCompleted)
            {
                existingTask.CompletedAt = null;
            }
            
            var updatedTask = await _taskRepository.UpdateAsync(existingTask);
            
            var responseDto = new TaskResponseDTO
            {
                Id = updatedTask.Id,
                Description = updatedTask.Description,
                DueDate = updatedTask.DueDate,
                Priority = updatedTask.Priority,
                Reminder = updatedTask.Reminder,
                IsCompleted = updatedTask.IsCompleted,
                UserId = updatedTask.UserId,
                CreatedAt = updatedTask.CreatedAt,
                CompletedAt = updatedTask.CompletedAt
            };
            
            return Ok(responseDto);
        }

        [HttpPut("{id}/complete")]
        public async Task<ActionResult<TaskResponseDTO>> CompleteTask(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            int userId = int.Parse(userIdClaim.Value);
            
            var task = await _taskRepository.GetByIdAsync(id);
            
            if (task == null)
            {
                return NotFound();
            }

            if (task.UserId != userId)
            {
                return Forbid();
            }

            task.IsCompleted = true;
            task.CompletedAt = DateTime.UtcNow;
            
            var updatedTask = await _taskRepository.UpdateAsync(task);

            // Send a notification about the completed task
            var notification = new Notification
            {
                UserId = userId,
                Title = "Task Completed",
                Message = $"You've completed the task: {task.Description}",
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                Type = "TaskCompleted",
                RelatedEntityId = task.Id,
                RelatedEntityType = "TaskItem"
            };

            await _notificationHubContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveNotification", notification);
            
            var responseDto = new TaskResponseDTO
            {
                Id = updatedTask.Id,
                Description = updatedTask.Description,
                DueDate = updatedTask.DueDate,
                Priority = updatedTask.Priority,
                Reminder = updatedTask.Reminder,
                IsCompleted = updatedTask.IsCompleted,
                UserId = updatedTask.UserId,
                CreatedAt = updatedTask.CreatedAt,
                CompletedAt = updatedTask.CompletedAt
            };
            
            return Ok(responseDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            int userId = int.Parse(userIdClaim.Value);
            
            var task = await _taskRepository.GetByIdAsync(id);
            
            if (task == null)
            {
                return NotFound();
            }

            if (task.UserId != userId)
            {
                return Forbid();
            }

            await _taskRepository.DeleteAsync(id);
            return NoContent();
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                throw new UnauthorizedAccessException();
            }
            return int.Parse(userIdClaim.Value);
        }
    }
} 