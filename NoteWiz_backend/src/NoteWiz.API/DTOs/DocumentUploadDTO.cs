using System;

namespace NoteWiz.API.DTOs
{
    public class DocumentUploadDTO
    {
        public int Id { get; set; }
        public string FilePath { get; set; }
        public string ExtractedText { get; set; }
        public DateTime UploadedAt { get; set; }
    }
} 