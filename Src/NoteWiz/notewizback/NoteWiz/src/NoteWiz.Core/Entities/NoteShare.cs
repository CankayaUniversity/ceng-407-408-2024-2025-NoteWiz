using System;
using NoteWiz.Core.Interfaces;
using NoteWiz.Core.Enums;

namespace NoteWiz.Core.Entities
{
    /// <summary>
    /// Tracks shared notes and permissions
    /// </summary>
    public class NoteShare : IEntity
    {
        public int Id { get; set; }
        public int NoteId { get; set; }
        public int? SharedWithUserId { get; set; }  // Null olabilir çünkü link paylaşımında kullanıcı olmayabilir
        public string? SharedWithEmail { get; set; } // Email ile paylaşım için
        public string? ShareLink { get; set; }      // Link paylaşımı için
        public string? ShareToken { get; set; }     // Güvenli link paylaşımı için token
        public bool CanEdit { get; set; }
        public DateTime SharedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ExpiresAt { get; set; }    // Link paylaşımı için son kullanma tarihi
        public ShareMethod ShareMethod { get; set; } = ShareMethod.Direct;
        public bool IsActive { get; set; } = true;  // Paylaşımın aktif olup olmadığı

        // Navigation properties
        public virtual Note Note { get; set; }
        public virtual User SharedWithUser { get; set; }
    }
} 