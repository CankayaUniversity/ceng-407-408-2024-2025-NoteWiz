using System;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    /// <summary>
    /// Stores authentication tokens for users
    /// </summary>
    public class AuthToken : IEntity
    {
        public int Id { get; set; }
        public string Token { get; set; }
        public int UserId { get; set; }
        public bool IsRevoked { get; set; }
        public DateTime ExpiresAt { get; set; }
        public string DeviceInfo { get; set; } // Stores device information for React Native clients
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual User User { get; set; }

        public AuthToken()
        {
            CreatedAt = DateTime.UtcNow;
            IsRevoked = false;
        }
    }
} 