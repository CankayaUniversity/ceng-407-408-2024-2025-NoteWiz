using System.ComponentModel.DataAnnotations;
using System;

namespace NoteWiz.API.DTOs
{
    /// <summary>
    /// Data Transfer Object for note share response data
    /// </summary>
    public class NoteShareResponseDTO
    {
        /// <summary>
        /// Share ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Note ID
        /// </summary>
        public int NoteId { get; set; }

        /// <summary>
        /// ID of the user the note is shared with
        /// </summary>
        public int SharedWithUserId { get; set; }

        /// <summary>
        /// Email of the user the note is shared with
        /// </summary>
        public required string SharedWithUserEmail { get; set; }

        /// <summary>
        /// Whether the user can edit the note
        /// </summary>
        public bool CanEdit { get; set; }

        /// <summary>
        /// Date and time the note was shared
        /// </summary>
        public DateTime SharedAt { get; set; }

        /// <summary>
        /// User response data for the shared user
        /// </summary>
        public UserResponseDTO? SharedWithUser { get; set; }
    }
} 