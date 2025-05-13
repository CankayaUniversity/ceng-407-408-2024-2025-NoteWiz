using System;

namespace NoteWiz.API.DTOs
{
    public class NoteShareCreateDTO
    {
        public string SharedWithUserEmail { get; set; } = string.Empty;
        public bool CanEdit { get; set; }
    }
} 