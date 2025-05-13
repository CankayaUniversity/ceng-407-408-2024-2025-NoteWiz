using System.ComponentModel.DataAnnotations;

namespace NoteWiz.API.DTOs
{
    /// <summary>
    /// Data Transfer Object for creating a note share
    /// </summary>
    public class CreateNoteShareDTO
    {
        /// <summary>
        /// ID of the note to share
        /// </summary>
        [Required]
        public int NoteId { get; set; }
        
        /// <summary>
        /// ID of the user to share the note with
        /// </summary>
        [Required]
        public int SharedWithUserId { get; set; }
        
        /// <summary>
        /// Whether the user can edit the note
        /// </summary>
        public bool CanEdit { get; set; } = false;
    }
    
    /// <summary>
    /// Data Transfer Object for updating a note share
    /// </summary>
    public class UpdateNoteShareDTO
    {
        /// <summary>
        /// Whether the user can edit the note
        /// </summary>
        [Required]
        public bool CanEdit { get; set; }
    }
    
    /// <summary>
    /// Data Transfer Object for user brief information
    /// </summary>
    public class UserBriefDTO
    {
        /// <summary>
        /// User ID
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// User email
        /// </summary>
        public required string Email { get; set; }
        
        /// <summary>
        /// Username
        /// </summary>
        public required string Username { get; set; }
    }
} 