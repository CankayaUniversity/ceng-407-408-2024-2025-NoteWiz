using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace NoteWiz.API.DTOs
{
    public class CreateFriendshipDTO
    {
        [Required]
        public int FriendUserId { get; set; }

        [StringLength(500)]
        public string? Message { get; set; }
    }

    public class UpdateFriendshipDTO
    {
        [Required]
        [RegularExpression("^(Accepted|Rejected)$")]
        public string Status { get; set; } = string.Empty;
    }

    public class FriendshipRequestDTO
    {
        [Required]
        public int ReceiverId { get; set; }
    }

    public class FriendshipResponseDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int FriendId { get; set; }
        public DateTime CreatedAt { get; set; }
        public UserResponseDTO Friend { get; set; } = new UserResponseDTO
        {
            Id = 0,
            Username = string.Empty,
            Email = string.Empty,
            FullName = string.Empty,
            CreatedAt = DateTime.MinValue
        };
    }

    public class FriendshipRequestResponseDTO
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public UserResponseDTO Sender { get; set; } = new UserResponseDTO
        {
            Id = 0,
            Username = string.Empty,
            Email = string.Empty,
            FullName = string.Empty,
            CreatedAt = DateTime.MinValue
        };
        public UserResponseDTO Receiver { get; set; } = new UserResponseDTO
        {
            Id = 0,
            Username = string.Empty,
            Email = string.Empty,
            FullName = string.Empty,
            CreatedAt = DateTime.MinValue
        };
    }

    public class UpdateFriendshipRequestDTO
    {
        [Required]
        public string Status { get; set; } = string.Empty; // "Accepted" or "Rejected"
    }
} 