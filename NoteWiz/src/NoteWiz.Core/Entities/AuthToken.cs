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
        public DateTime ExpiryDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public int UserId { get; set; }
        public string DeviceInfo { get; set; } // Stores device information for React Native clients
        public DateTime LastUsedAt { get; set; }

        // Navigation properties
        public virtual User User { get; set; }
    }
} 