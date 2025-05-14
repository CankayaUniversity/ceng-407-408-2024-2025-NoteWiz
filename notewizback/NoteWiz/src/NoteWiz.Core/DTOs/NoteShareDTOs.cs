using System;
using System.ComponentModel.DataAnnotations;
using NoteWiz.Core.Enums;

namespace NoteWiz.Core.DTOs
{
    public class CreateNoteShareDTO
    {
        [Required]
        public int NoteId { get; set; }
        public int? SharedWithUserId { get; set; }
        public string? SharedWithEmail { get; set; }
        public bool CanEdit { get; set; } = false;
        public ShareMethod ShareMethod { get; set; } = ShareMethod.Direct;
        public DateTime? ExpiresAt { get; set; }
    }

    public class UpdateNoteShareDTO
    {
        [Required]
        public bool CanEdit { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsActive { get; set; }
    }

    public class UserBriefDTO
    {
        public int Id { get; set; }
        public required string Email { get; set; }
        public required string Username { get; set; }
    }

    public class NoteShareResponseDTO
    {
        public int Id { get; set; }
        public int NoteId { get; set; }
        public string NoteTitle { get; set; }
        public int? SharedWithUserId { get; set; }
        public string? SharedWithEmail { get; set; }
        public string? ShareLink { get; set; }
        public bool CanEdit { get; set; }
        public DateTime SharedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public ShareMethod ShareMethod { get; set; }
        public bool IsActive { get; set; }
        public UserResponseDTO? SharedWithUser { get; set; }
    }

    public class ShareLinkResponseDTO
    {
        public string ShareLink { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool CanEdit { get; set; }
    }
} 