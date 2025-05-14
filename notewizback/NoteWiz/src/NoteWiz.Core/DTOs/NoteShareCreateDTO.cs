using System;

namespace NoteWiz.Core.DTOs
{
    public class NoteShareCreateDTO
    {
        public int NoteId { get; set; }
        public int? SharedWithUserId { get; set; }
        public string? SharedWithEmail { get; set; }
        public bool CanEdit { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }
} 