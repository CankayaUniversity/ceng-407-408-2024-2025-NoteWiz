using System;

namespace NoteWiz.Core.Models.AI
{
    public class AIChatResponse
    {
        public string ResponseText { get; set; } = string.Empty;
        public int TokensUsed { get; set; }
        public bool IsSuccess { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public double ProcessingTime { get; set; } // milliseconds
    }
} 