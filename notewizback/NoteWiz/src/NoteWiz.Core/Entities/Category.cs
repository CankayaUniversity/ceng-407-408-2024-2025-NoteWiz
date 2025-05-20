using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    public class Category : IEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

<<<<<<< HEAD
=======
        public string Description { get; set; }

        public string Color { get; set; }

>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
<<<<<<< HEAD
        public virtual User? User { get; set; }

        // Navigation properties
        public virtual ICollection<Note> Notes { get; set; } = new List<Note>();

=======
        public virtual User User { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public ICollection<Document> Documents { get; set; }
        public ICollection<Note> Notes { get; set; }
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
    }
} 