using System.ComponentModel.DataAnnotations;

namespace NoteWiz.API.DTOs
{
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
        [Required]
        public required string Title { get; set; }
        
        /// <summary>
        /// Note content
        /// </summary>
        [Required]
        public required string Content { get; set; }

        public List<string> Tags { get; set; } = new();

        [RegularExpression("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")]
        public required string Color { get; set; }

        public bool IsPinned { get; set; }

        public bool IsPrivate { get; set; }

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
} 