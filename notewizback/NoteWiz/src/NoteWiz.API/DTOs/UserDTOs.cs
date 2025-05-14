using System.ComponentModel.DataAnnotations;
using NoteWiz.Core.DTOs;

namespace NoteWiz.API.DTOs
{
    public class RegisterDTO
    {
        [Required]
        [StringLength(50)]
        public required string Username { get; set; }

        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        [StringLength(100)]
        public required string FullName { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public required string Password { get; set; }
    }

    public class LoginDTO
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public required string Password { get; set; }
    }

    public class LoginResponseDTO
    {
        public required string Token { get; set; }
        public required UserResponseDTO User { get; set; }
    }
} 