using System;
using System.Collections.Generic;

namespace NoteWiz.Core.DTOs
{
    public class NoteResponseDTO
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Content { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsPrivate { get; set; }
        public string? Color { get; set; }
        public string? CoverImage { get; set; }
        public List<NoteShareResponseDTO>? SharedWith { get; set; }
        public UserResponseDTO? User { get; set; }
        public bool IsPdf { get; set; }
        public string? PdfUrl { get; set; }
        public int? DocumentId { get; set; }
        public bool IsPinned { get; set; }
        public List<string> Tags { get; set; } = new();
        public int? CategoryId { get; set; }
        public bool IsSynced { get; set; }
        public DateTime? LastSyncedAt { get; set; }
    }
} 