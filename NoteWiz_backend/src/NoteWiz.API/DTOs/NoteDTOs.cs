using System.ComponentModel.DataAnnotations;

namespace NoteWiz.API.DTOs
{
    /// <summary>
    /// Data Transfer Object for creating a note
    /// </summary>
    public class CreateNoteDTO
    {
        /// <summary>
        /// Note title
        /// </summary>
        [Required]
        [StringLength(200)]
        public required string Title { get; set; }
        
        /// <summary>
        /// Note content
        /// </summary>
        [Required]
        public required string Content { get; set; }

        public List<string> Tags { get; set; } = new();

        [RegularExpression("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")]
        public string Color { get; set; } = "#FFFFFF";

        public bool IsPinned { get; set; } = false;

        /// <summary>
        /// Cover ID for the note
        /// </summary>
        public string? CoverId { get; set; }

        /// <summary>
        /// Cover color for the note
        /// </summary>
        [RegularExpression("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")]
        public string? CoverColor { get; set; }

        /// <summary>
        /// Whether the note is archived
        /// </summary>
        public bool IsArchived { get; set; } = false;
    }
    
    /// <summary>
    /// Data Transfer Object for updating a note
    /// </summary>
    public class UpdateNoteDTO
    {
        /// <summary>
        /// Note title
        /// </summary>
        [Required]
        [StringLength(200)]
        public required string Title { get; set; }
        
        /// <summary>
        /// Note content
        /// </summary>
        [Required]
        public required string Content { get; set; }

        public List<string> Tags { get; set; } = new();

        [RegularExpression("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")]
        public string Color { get; set; } = "#FFFFFF";

        public bool IsPinned { get; set; }

        /// <summary>
        /// Cover ID for the note
        /// </summary>
        public string? CoverId { get; set; }

        /// <summary>
        /// Cover color for the note
        /// </summary>
        [RegularExpression("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")]
        public string? CoverColor { get; set; }

        /// <summary>
        /// Whether the note is archived
        /// </summary>
        public bool IsArchived { get; set; }
    }
    
    /// <summary>
    /// Data Transfer Object for note response data
    /// </summary>
    public class NoteResponseDTO
    {
        /// <summary>
        /// Note ID
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Note title
        /// </summary>
        public required string Title { get; set; }
        
        /// <summary>
        /// Note content
        /// </summary>
        public required string Content { get; set; }
        
        /// <summary>
        /// Tags associated with the note
        /// </summary>
        public List<string> Tags { get; set; } = new();
        
        /// <summary>
        /// Color of the note
        /// </summary>
        public required string Color { get; set; }
        
        /// <summary>
        /// Whether the note is pinned
        /// </summary>
        public bool IsPinned { get; set; }

        /// <summary>
        /// Cover ID for the note
        /// </summary>
        public string? CoverId { get; set; }

        /// <summary>
        /// Cover color for the note
        /// </summary>
        public string? CoverColor { get; set; }

        /// <summary>
        /// Whether the note is archived
        /// </summary>
        public bool IsArchived { get; set; }
        
        /// <summary>
        /// ID of the user who created the note
        /// </summary>
        public int UserId { get; set; }
        
        /// <summary>
        /// Creation date
        /// </summary>
        public DateTime CreatedAt { get; set; }
        
        /// <summary>
        /// Last update date
        /// </summary>
        public DateTime? UpdatedAt { get; set; }
        
        /// <summary>
        /// List of users who have shared the note
        /// </summary>
        public List<NoteShareResponseDTO> SharedWith { get; set; } = new();
    }
    
    /// <summary>
    /// Data Transfer Object for sharing a note
    /// </summary>
    public class NoteShareDTO
    {
        /// <summary>
        /// ID of the user to share the note with
        /// </summary>
        [Required]
        public int SharedWithUserId { get; set; }
        
        /// <summary>
        /// Whether the shared user can edit the note
        /// </summary>
        public bool CanEdit { get; set; }
    }
} 