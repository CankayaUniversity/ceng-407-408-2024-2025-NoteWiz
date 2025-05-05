using System;
using System.ComponentModel.DataAnnotations;

namespace NoteWiz.API.DTOs
{
    public class NoteDrawingDTO
    {
        public int Id { get; set; }
        public string DrawingData { get; set; }
        public string Position { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateNoteDrawingDTO
    {
        [Required]
        public string DrawingData { get; set; }
        
        [Required]
        public string Position { get; set; }
    }

    public class UpdateNoteDrawingDTO
    {
        public string Position { get; set; }
    }
} 