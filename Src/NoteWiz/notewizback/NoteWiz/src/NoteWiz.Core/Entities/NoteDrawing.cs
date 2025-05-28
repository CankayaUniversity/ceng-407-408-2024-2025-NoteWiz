using System;
using NoteWiz.Core.Interfaces;
using System.Text.Json.Serialization;

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
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        [JsonIgnore]
        public virtual Note Note { get; set; }
    }
} 