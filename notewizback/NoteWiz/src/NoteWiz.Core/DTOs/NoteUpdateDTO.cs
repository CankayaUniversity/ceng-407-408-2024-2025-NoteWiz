using System;
<<<<<<< HEAD
using System.Collections.Generic;
=======
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

namespace NoteWiz.Core.DTOs
{
    public class NoteUpdateDTO
    {
<<<<<<< HEAD
        public string Title { get; set; }
        public string? Content { get; set; }
        public int? DocumentId { get; set; }
        public string? Color { get; set; }
        public bool IsPinned { get; set; }
        public bool IsPrivate { get; set; }
        public string? CoverImageUrl { get; set; }
        public string? CoverImage { get; set; }
        public string? Tags { get; set; }
        public int? CategoryId { get; set; }
        public string? PageType { get; set; }
        public string? Summary { get; set; }
=======
        public required string Title { get; set; }
        public required string Content { get; set; }
        public bool IsPrivate { get; set; }
        public string? Color { get; set; }
        public string? CoverImage { get; set; }
        public int? CategoryId { get; set; }
        public bool IsOffline { get; set; }
        public string? SyncStatus { get; set; }
        public DateTime? LastModifiedAt { get; set; }
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
    }
} 