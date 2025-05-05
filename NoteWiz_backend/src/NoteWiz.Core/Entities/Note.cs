using System;
using System.Collections.Generic;
using NoteWiz.Core.Interfaces;
using NoteWiz.Core.Enums;
using System.ComponentModel.DataAnnotations;

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
        public CoverType CoverType { get; set; } = CoverType.None;
        public string? CoverColor { get; set; }
        public CoverPosition CoverPosition { get; set; } = CoverPosition.Center;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int UserId { get; set; }
        public bool IsSynced { get; set; } // For mobile sync status
        public DateTime? LastSyncedAt { get; set; }
        public List<string> Tags { get; set; } = new();
        [RegularExpression("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")]
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