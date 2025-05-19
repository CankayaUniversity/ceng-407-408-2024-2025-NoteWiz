using System;

namespace NoteWiz.Core.DTOs
{
    public class UserResponseDTO
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public string? ProfilePictureUrl { get; set; }
    }
} 