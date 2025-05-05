using System.ComponentModel.DataAnnotations;

namespace NoteWiz.Core.Entities
{
    public class CoverImage
    {
        [Key]
        public string Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Title { get; set; }
        
        public string? ImageUrl { get; set; }
        
        public string? Color { get; set; }
        
        public bool IsDefault { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 