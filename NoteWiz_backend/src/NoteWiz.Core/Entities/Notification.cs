using System;
using System.ComponentModel.DataAnnotations;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    /// <summary>
    /// Manages push notifications for mobile clients
    /// </summary>
    public class Notification : IEntity
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        
        [Required]
        public string Message { get; set; }
        
        public int? NoteId { get; set; }
        
        public int? TaskId { get; set; }
        
        public bool IsRead { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? ReadAt { get; set; }
        
        // Navigation properties
        public User User { get; set; }
        public Note Note { get; set; }
        public TaskItem Task { get; set; }
    }
} 