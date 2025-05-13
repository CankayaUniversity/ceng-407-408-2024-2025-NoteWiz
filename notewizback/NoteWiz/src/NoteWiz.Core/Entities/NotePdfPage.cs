using System;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    public class NotePdfPage : IEntity
    {
        public int Id { get; set; }
        public int NoteId { get; set; }
        public string PdfUrl { get; set; }
        public int PageNumber { get; set; }
        public string ExtractedText { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Note Note { get; set; }

        public NotePdfPage()
        {
            CreatedAt = DateTime.UtcNow;
        }
    }
} 