using System;

namespace NoteWiz.Core.Models.AI
{
    public class AIChatMessage
    {
        public string Role { get; set; } = "user"; // "user" veya "assistant"
        public string Content { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
} 