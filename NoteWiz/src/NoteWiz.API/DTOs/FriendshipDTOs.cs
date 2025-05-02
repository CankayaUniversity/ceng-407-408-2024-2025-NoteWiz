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