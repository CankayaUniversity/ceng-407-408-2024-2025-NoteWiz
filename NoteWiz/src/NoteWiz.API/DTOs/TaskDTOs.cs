using System.ComponentModel.DataAnnotations;

namespace NoteWiz.API.DTOs
{
    public class CreateTaskDTO
    {
        [Required]
        [StringLength(200)]
        public required string Title { get; set; }

        [Required]
        [StringLength(500)]
        public required string Description { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        [Range(1, 3)]
        public int Priority { get; set; } = 3;

        public DateTime? Reminder { get; set; }

        public bool IsCompleted { get; set; } = false;
    }

    public class UpdateTaskDTO
    {
        [Required]
        [StringLength(200)]
        public required string Title { get; set; }

        [Required]
        [StringLength(500)]
        public required string Description { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        [Range(1, 3)]
        public int Priority { get; set; }

        public DateTime? Reminder { get; set; }

        public bool IsCompleted { get; set; }
    }

    public class TaskResponseDTO
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public DateTime DueDate { get; set; }
        public int Priority { get; set; }
        public DateTime? Reminder { get; set; }
        public bool IsCompleted { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
} 