using System;
using System.Collections.Generic;
using NoteWiz.Core.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace NoteWiz.Core.Entities
{
    /// <summary>
    /// Represents app users (standard or admin)
    /// </summary>
    public class User : IEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Username { get; set; }

        [Required]
        public string FullName { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public bool IsAdmin { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<Note> Notes { get; set; }
        public virtual ICollection<TaskItem> Tasks { get; set; }
        public virtual ICollection<Friendship> Friendships { get; set; }
        public virtual ICollection<AuthToken> AuthTokens { get; set; }
        public virtual ICollection<NoteShare> SharedWithMe { get; set; }
        public virtual ICollection<UserDevice> Devices { get; set; }
        public virtual ICollection<Notification> Notifications { get; set; }
        public virtual ICollection<Friendship> FriendshipsInitiated { get; set; }
        public virtual ICollection<Friendship> FriendshipsReceived { get; set; }
        public virtual ICollection<Document> Documents { get; set; }

        public User()
        {
            Notes = new HashSet<Note>();
            Tasks = new HashSet<TaskItem>();
            Friendships = new HashSet<Friendship>();
            AuthTokens = new HashSet<AuthToken>();
            SharedWithMe = new HashSet<NoteShare>();
            Devices = new HashSet<UserDevice>();
            Notifications = new HashSet<Notification>();
            FriendshipsInitiated = new HashSet<Friendship>();
            FriendshipsReceived = new HashSet<Friendship>();
            Documents = new HashSet<Document>();
        }
    }
} 