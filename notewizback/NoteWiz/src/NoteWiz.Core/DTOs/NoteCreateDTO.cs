using System;

namespace NoteWiz.Core.DTOs
{
    public class NoteCreateDTO
    {
        public required string Title { get; set; }
        public required string Content { get; set; }
        public bool IsPrivate { get; set; }
        public string? Color { get; set; }
        public string? CoverImage { get; set; }
        public int? CategoryId { get; set; }
    }
} 