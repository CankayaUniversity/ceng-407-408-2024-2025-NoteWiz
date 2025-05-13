using System;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    public class AIInteractionLog : IEntity
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string InteractionType { get; set; }
        public string InputPrompt { get; set; }
        public string AIResponse { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? NoteId { get; set; }
        public string ModelUsed { get; set; }
        public int TokensUsed { get; set; }
        public int ProcessingTime { get; set; }
        public decimal Cost { get; set; }

        // Navigation properties
        public virtual User User { get; set; }
        public virtual Note Note { get; set; }

        public AIInteractionLog()
        {
            CreatedAt = DateTime.UtcNow;
        }
    }
} 