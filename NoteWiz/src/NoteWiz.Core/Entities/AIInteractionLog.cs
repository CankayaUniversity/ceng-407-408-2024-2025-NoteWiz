using System;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    public class AIInteractionLog : IEntity
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string InteractionType { get; set; }
        public string UserInput { get; set; }
        public string AIResponse { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual User User { get; set; }

        public AIInteractionLog()
        {
            CreatedAt = DateTime.UtcNow;
        }
    }
} 