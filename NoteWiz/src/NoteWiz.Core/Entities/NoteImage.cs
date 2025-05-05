using System;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    /// <summary>
    /// Stores images embedded into notes
    /// </summary>
    public class NoteImage : IEntity
    {
        public int Id { get; set; }
        public int NoteId { get; set; }
        public string ImageUrl { get; set; }
        public string Position { get; set; } // Optional position or alignment info
        public DateTime UploadedAt { get; set; }

        // Navigation properties
        public virtual Note Note { get; set; }
    }
} 