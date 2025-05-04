using System;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    public class NoteAISelection : IEntity
    {
        public int Id { get; set; }
        public int NoteId { get; set; }
        public string SelectedText { get; set; }
        public string AIResponse { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Note Note { get; set; }

        public NoteAISelection()
        {
            CreatedAt = DateTime.UtcNow;
        }
    }
} 