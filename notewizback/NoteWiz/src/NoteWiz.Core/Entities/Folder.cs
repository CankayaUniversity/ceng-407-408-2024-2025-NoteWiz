using System.Collections.Generic;

namespace NoteWiz.Core.Entities
{
    public class Folder
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = "#FFFFFF";
        public ICollection<Note> Notes { get; set; } = new List<Note>();
        public ICollection<FolderNote> FolderNotes { get; set; } = new List<FolderNote>();
    }
} 