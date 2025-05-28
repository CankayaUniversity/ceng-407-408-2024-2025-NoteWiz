using System;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    public class NoteAIPopup : IEntity
    {
        public int Id { get; set; }
        public int NoteId { get; set; }
        public string Suggestion { get; set; }
        public bool IsAccepted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Note Note { get; set; }

        public NoteAIPopup()
        {
            CreatedAt = DateTime.UtcNow;
        }
    }
} 