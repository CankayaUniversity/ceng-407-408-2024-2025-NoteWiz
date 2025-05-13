using System;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    /// <summary>
    /// Tasks associated with user productivity
    /// </summary>
    public class TaskItem : IEntity
    {
        public int Id { get; set; }
        public string Title { get; set; } // Görev başlığı
        public string Description { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime DueDate { get; set; }
        public int UserId { get; set; }
        public DateTime? Reminder { get; set; } // For mobile notifications
        public int Priority { get; set; } // Task priority level
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }

        // Navigation properties
        public virtual User User { get; set; }
    }
} 