using System;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    /// <summary>
    /// Stores user-drawn strokes or handwriting on notes
    /// </summary>
    public class NoteDrawing : IEntity
    {
        public int Id { get; set; }
        public int NoteId { get; set; }
        public string DrawingData { get; set; } // JSON serialized stroke data
        public string Position { get; set; } // Position of the drawing on the note
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public virtual Note Note { get; set; }
    }
} 