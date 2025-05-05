using System;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    /// <summary>
    /// Tracks shared notes and permissions
    /// </summary>
    public class NoteShare : IEntity
    {
        public int Id { get; set; }
        public int NoteId { get; set; }
        public int SharedWithUserId { get; set; }
        public bool CanEdit { get; set; }
        public DateTime SharedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Note Note { get; set; }
        public virtual User SharedWithUser { get; set; }
    }
} 