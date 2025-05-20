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
<<<<<<< HEAD
        public bool IsActive { get; set; }
=======
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
        public string? ProfilePictureUrl { get; set; }
    }
} 