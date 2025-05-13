using System;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    /// <summary>
    /// Manages push notifications for mobile clients
    /// </summary>
    public class Notification : IEntity
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public int UserId { get; set; }
        public bool IsRead { get; set; }
        public string Type { get; set; } // Task reminder, note share, etc.
        public int? RelatedEntityId { get; set; } // ID of related note or task
        public string RelatedEntityType { get; set; } // Type of related entity
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual User User { get; set; }

        public Notification()
        {
            CreatedAt = DateTime.UtcNow;
            IsRead = false;
        }
    }
} 