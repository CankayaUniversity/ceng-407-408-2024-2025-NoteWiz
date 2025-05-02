using System;
using System.Collections.Generic;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    /// <summary>
    /// Stores notes created by users
    /// </summary>
    public class Note : IEntity
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string? CoverImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int UserId { get; set; }
        public bool IsSynced { get; set; } // For mobile sync status
        public DateTime? LastSyncedAt { get; set; }
        public List<string> Tags { get; set; } = new();
        public string Color { get; set; } = "#FFFFFF";
        public bool IsPinned { get; set; }

        // Navigation properties
        public virtual User User { get; set; }
        public virtual ICollection<NoteShare> SharedWith { get; set; }
        public virtual ICollection<NoteDrawing> NoteDrawings { get; set; }
        public virtual ICollection<NoteImage> NoteImages { get; set; }

        public Note()
        {
            SharedWith = new HashSet<NoteShare>();
            NoteDrawings = new HashSet<NoteDrawing>();
            NoteImages = new HashSet<NoteImage>();
            Tags = new List<string>();
        }
    }
} 