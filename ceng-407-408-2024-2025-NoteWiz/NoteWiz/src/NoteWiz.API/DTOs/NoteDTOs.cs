using System.ComponentModel.DataAnnotations;
using NoteWiz.Core.Entities;

namespace NoteWiz.API.DTOs
{
    public class CreateNoteDTO
    {
        [Required]
        [StringLength(200)]
        public required string Title { get; set; }
        
        [Required]
        public required string Content { get; set; }

        public List<string> Tags { get; set; } = new();

        [RegularExpression("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")]
        public string Color { get; set; } = "#FFFFFF";

        public bool IsPinned { get; set; } = false;

        public CoverType CoverType { get; set; } = CoverType.None;

        [RegularExpression("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")]
        public string? CoverColor { get; set; }

        public string? CoverImageUrl { get; set; }

        public CoverPosition CoverPosition { get; set; } = CoverPosition.Top;

        public bool IsArchived { get; set; } = false;
    }
    
    public class UpdateNoteDTO
    {
        [Required]
        [StringLength(200)]
        public required string Title { get; set; }
        
        [Required]
        public required string Content { get; set; }

        public List<string> Tags { get; set; } = new();

        [RegularExpression("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")]
        public string Color { get; set; } = "#FFFFFF";

        public bool IsPinned { get; set; }

        public CoverType CoverType { get; set; }

        [RegularExpression("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")]
        public string? CoverColor { get; set; }

        public string? CoverImageUrl { get; set; }

        public CoverPosition CoverPosition { get; set; }

        public bool IsArchived { get; set; }
    }
    
    public class UpdateCoverDTO
    {
        public CoverType CoverType { get; set; }

        [RegularExpression("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")]
        public string? CoverColor { get; set; }

        public string? CoverImageUrl { get; set; }

        public CoverPosition CoverPosition { get; set; }
    }
    
    public class NoteResponseDTO
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Content { get; set; }
        public List<string> Tags { get; set; } = new();
        public required string Color { get; set; }
        public bool IsPinned { get; set; }
        public CoverType CoverType { get; set; }
        public string? CoverColor { get; set; }
        public string? CoverImageUrl { get; set; }
        public CoverPosition CoverPosition { get; set; }
        public bool IsArchived { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
} 