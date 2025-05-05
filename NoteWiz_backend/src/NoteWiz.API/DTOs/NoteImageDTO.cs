using System.ComponentModel.DataAnnotations;

namespace NoteWiz.API.DTOs
{
    public class NoteImageDTO
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; }
        public string Position { get; set; }
        public DateTime UploadedAt { get; set; }
    }

    public class CreateNoteImageDTO
    {
        [Required]
        public IFormFile Image { get; set; }
        
        [Required]
        public string Position { get; set; }
    }

    public class UpdateNoteImageDTO
    {
        public string Position { get; set; }
    }
} 