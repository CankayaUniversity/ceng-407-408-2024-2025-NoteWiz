using System.Collections.Generic;

namespace NoteWiz.Core.Models.AI
{
    public class AIChatRequest
    {
        public string Prompt { get; set; } = string.Empty;
        public int? MaxTokens { get; set; } = 1024;
        public float? Temperature { get; set; } = 0.7f;
        public List<AIChatMessage> PreviousMessages { get; set; } = new List<AIChatMessage>();
    }
} 