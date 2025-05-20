using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    /// <summary>
    /// Stores notes created by users
    /// </summary>
    public class Note : IEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        public string? Content { get; set; }

        [Required]
        public int UserId { get; set; }

        public int? DocumentId { get; set; }

        [Required]
        [MaxLength(14)]
        public string Color { get; set; } = "#FFFFFF";

        public bool IsPinned { get; set; }

        public bool IsPrivate { get; set; } = true; // Default to private

        [NotMapped]
        public string? CoverImage
        {
            get => CoverImageUrl;
            set => CoverImageUrl = value;
        }
        public string? CoverImageUrl { get; set; }

        public List<string> Tags { get; set; } = new();

        public int? CategoryId { get; set; }

        public string? Summary { get; set; }

        [ForeignKey("CategoryId")]
        public Category Category { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public bool IsSynced { get; set; } // For mobile sync status
        public DateTime? LastSyncedAt { get; set; }

        public string? PageType { get; set; }

        public int? FolderId { get; set; }
        public virtual Folder Folder { get; set; }
        public virtual ICollection<FolderNote> FolderNotes { get; set; } = new List<FolderNote>(); // Many-to-many

        public bool IsOffline { get; set; }
        public DateTime? LastModifiedAt { get; set; }
        public string? DeviceId { get; set; }
        public string? SyncStatus { get; set; } // "synced", "pending", "conflict"

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [ForeignKey("DocumentId")]
        public virtual Document Document { get; set; }

        public virtual ICollection<NoteShare> SharedWith { get; set; }
        public virtual ICollection<NoteDrawing> NoteDrawings { get; set; }
        public virtual ICollection<NoteImage> NoteImages { get; set; }

        public Note()
        {
            Tags = new List<string>();
            SharedWith = new HashSet<NoteShare>();
            NoteDrawings = new HashSet<NoteDrawing>();
            NoteImages = new HashSet<NoteImage>();
            CreatedAt = DateTime.UtcNow;
            LastModifiedAt = DateTime.UtcNow;
            SyncStatus = "synced";
            IsOffline = false;
            IsPrivate = true; // Default to private
        }
    }
} 