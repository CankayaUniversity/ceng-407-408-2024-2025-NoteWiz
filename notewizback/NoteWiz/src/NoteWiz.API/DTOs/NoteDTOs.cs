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
        public bool IsPrivate { get; set; } = true;
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
        public bool IsPrivate { get; set; }
    }

    public class NoteShareDTO
    {
        [Required]
        public string SharedWithUserEmail { get; set; } = string.Empty;
        public bool CanEdit { get; set; }
    }
} 