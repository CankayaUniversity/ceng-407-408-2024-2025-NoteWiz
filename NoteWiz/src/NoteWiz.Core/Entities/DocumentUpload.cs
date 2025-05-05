using System;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    /// <summary>
    /// Holds OCR-uploaded document data
    /// </summary>
    public class DocumentUpload : IEntity
    {
        public int Id { get; set; }
        public string FilePath { get; set; }
        public string ExtractedText { get; set; }
        public DateTime UploadedAt { get; set; }
        public int UserId { get; set; }

        // Navigation properties
        public virtual User User { get; set; }
    }
} 