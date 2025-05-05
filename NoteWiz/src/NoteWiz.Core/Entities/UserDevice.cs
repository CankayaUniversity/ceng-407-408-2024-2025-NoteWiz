using System;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    /// <summary>
    /// Tracks user device information for mobile app
    /// </summary>
    public class UserDevice : IEntity
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string DeviceId { get; set; }
        public string DeviceType { get; set; } // iOS/Android
        public string PushNotificationToken { get; set; }
        public DateTime LastActiveAt { get; set; }
        public string AppVersion { get; set; }

        // Navigation properties
        public virtual User User { get; set; }
    }
} 