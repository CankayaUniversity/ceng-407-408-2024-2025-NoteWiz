using System.ComponentModel.DataAnnotations;

namespace NoteWiz.API.DTOs.AI
{
    public class AIChatRequestDTO
    {
        [Required]
        [StringLength(1000, MinimumLength = 1)]
        public string Prompt { get; set; } = string.Empty;

        [Range(1, 4096)]
        public int? MaxTokens { get; set; } = 1024;

        [Range(0.0, 2.0)]
        public float? Temperature { get; set; } = 0.7f;
    }
} 