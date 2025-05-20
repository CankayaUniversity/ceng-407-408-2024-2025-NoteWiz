using System;

namespace NoteWiz.Core.DTOs
{
    public class NoteDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public bool IsPrivate { get; set; }
        public string Color { get; set; }
        public string CoverImage { get; set; }
        public int? CategoryId { get; set; }
        public bool IsOffline { get; set; }
        public string SyncStatus { get; set; }
        public DateTime? LastModifiedAt { get; set; }
    }
} 