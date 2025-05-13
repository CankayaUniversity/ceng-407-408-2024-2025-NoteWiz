using System;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    public class NoteText : IEntity
    {
        public int Id { get; set; }
        public int NoteId { get; set; }
        public string Content { get; set; }
        public int Position { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Note Note { get; set; }

        public NoteText()
        {
            CreatedAt = DateTime.UtcNow;
        }
    }
} 