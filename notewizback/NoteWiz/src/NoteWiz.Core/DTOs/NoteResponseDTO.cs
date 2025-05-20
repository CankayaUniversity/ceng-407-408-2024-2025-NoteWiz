using System;
using System.Collections.Generic;

namespace NoteWiz.Core.DTOs
{
    public class NoteResponseDTO
    {
        public int Id { get; set; }
<<<<<<< HEAD
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
=======
        public required string Title { get; set; }
        public required string Content { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsPrivate { get; set; }
        public string? Color { get; set; }
        public string? CoverImage { get; set; }
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
        public List<NoteShareResponseDTO>? SharedWith { get; set; }
        public UserResponseDTO? User { get; set; }
        public bool IsPdf { get; set; }
        public string? PdfUrl { get; set; }
<<<<<<< HEAD
        public string? Summary { get; set; }
=======
        public int? DocumentId { get; set; }
        public bool IsPinned { get; set; }
        public List<string> Tags { get; set; } = new();
        public int? CategoryId { get; set; }
        public bool IsSynced { get; set; }
        public DateTime? LastSyncedAt { get; set; }
        public bool IsOffline { get; set; }
        public string? SyncStatus { get; set; }
        public DateTime? LastModifiedAt { get; set; }
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
    }
} 