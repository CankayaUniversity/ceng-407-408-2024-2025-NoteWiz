using System;
using System.Collections.Generic;

namespace NoteWiz.Core.DTOs
{
    public class NoteCreateDTO
    {
        public required string Title { get; set; }
        public string? Content { get; set; }
        public int UserId { get; set; }
        public int? DocumentId { get; set; }
        public string? Color { get; set; }
        public bool IsPinned { get; set; }
        public bool IsPrivate { get; set; }
        public string? CoverImageUrl { get; set; }
        public string? CoverImage { get; set; }
        public List<string> Tags { get; set; } = new();
        public int? CategoryId { get; set; }
        public string? PageType { get; set; }
        public bool IsOffline { get; set; }
        public string? SyncStatus { get; set; }
        public DateTime? LastModifiedAt { get; set; }
    }
} 