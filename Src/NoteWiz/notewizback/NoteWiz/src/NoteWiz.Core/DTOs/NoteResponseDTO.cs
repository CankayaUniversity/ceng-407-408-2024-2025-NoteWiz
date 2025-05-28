using System;
using System.Collections.Generic;

namespace NoteWiz.Core.DTOs
{
    public class NoteResponseDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string? Content { get; set; }
        public int UserId { get; set; }
        public int? DocumentId { get; set; }
        public string? Color { get; set; }
        public bool IsPinned { get; set; }
        public bool IsPrivate { get; set; }
        public string? CoverImageUrl { get; set; }
        public string? CoverImage { get; set; }
        public string? Tags { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsSynced { get; set; }
        public DateTime? LastSyncedAt { get; set; }
        public int? CategoryId { get; set; }
        public string? PageType { get; set; }
        public List<NoteShareResponseDTO>? SharedWith { get; set; }
        public UserResponseDTO? User { get; set; }
        public bool IsPdf { get; set; }
        public string? PdfUrl { get; set; }
        public string? Summary { get; set; }
        public int? FolderId { get; set; }
    }
} 