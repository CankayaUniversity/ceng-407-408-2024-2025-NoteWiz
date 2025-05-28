using System;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    public class NoteTemplate : IEntity
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Content { get; set; }
        public bool IsPublic { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual User User { get; set; }

        public NoteTemplate()
        {
            CreatedAt = DateTime.UtcNow;
        }
    }
} 