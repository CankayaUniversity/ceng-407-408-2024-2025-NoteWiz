using System;

namespace NoteWiz.API.DTOs
{
    public class NoteUpdateDTO
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsPrivate { get; set; }
    }
} 