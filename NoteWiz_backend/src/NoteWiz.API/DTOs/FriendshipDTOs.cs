using System;
using System.ComponentModel.DataAnnotations;

namespace NoteWiz.API.DTOs
{
    public class FriendshipDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int FriendId { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public UserResponseDTO Friend { get; set; }
    }

    public class CreateFriendshipDTO
    {
        [Required]
        public int FriendId { get; set; }

        [StringLength(500)]
        public string? Message { get; set; }
    }

    public class UpdateFriendshipDTO
    {
        [Required]
        [RegularExpression("^(Accepted|Rejected)$")]
        public required string Status { get; set; }
    }

    public class FriendshipResponseDTO
    {
        public int Id { get; set; }
        public int RequestedByUserId { get; set; }
        public int RequestedToUserId { get; set; }
        public required string Status { get; set; }
        public string? Message { get; set; }
        public DateTime RequestedAt { get; set; }
        public DateTime? RespondedAt { get; set; }
        public required UserResponseDTO RequestedByUser { get; set; }
        public required UserResponseDTO RequestedToUser { get; set; }
    }
} 