using System;
using System.ComponentModel.DataAnnotations;

namespace NoteWiz.API.DTOs
{
    public class UserDeviceDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string DeviceId { get; set; }
        public string DeviceType { get; set; }
        public string PushNotificationToken { get; set; }
        public DateTime LastActiveAt { get; set; }
        public string AppVersion { get; set; }
    }

    public class CreateUserDeviceDTO
    {
        [Required]
        public string DeviceId { get; set; }

        [Required]
        public string DeviceType { get; set; }

        [Required]
        public string PushNotificationToken { get; set; }

        [Required]
        public string AppVersion { get; set; }
    }

    public class UpdateUserDeviceDTO
    {
        public string PushNotificationToken { get; set; }
        public string AppVersion { get; set; }
    }
} 