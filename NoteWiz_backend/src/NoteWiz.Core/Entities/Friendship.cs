using System;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    /// <summary>
    /// Handles user-to-user friend relationships
    /// </summary>
    public class Friendship : IEntity
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int FriendId { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Accepted, Rejected
        public string? Message { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual User User { get; set; }
        public virtual User Friend { get; set; }
    }
} 