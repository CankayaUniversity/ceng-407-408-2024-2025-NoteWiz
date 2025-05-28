using System;

namespace NoteWiz.API.DTOs.AI
{
    public class AIChatResponseDTO
    {
        public string ResponseText { get; set; } = string.Empty;
        public int TokensUsed { get; set; }
        public bool IsSuccess { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public double ProcessingTime { get; set; }
    }
} 