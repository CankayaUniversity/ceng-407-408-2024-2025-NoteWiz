using System.ComponentModel.DataAnnotations.Schema;

namespace NoteWiz.Core.Entities
{
    public class FolderNote
    {
        public int FolderId { get; set; }
        public Folder Folder { get; set; }
        public int NoteId { get; set; }
        public Note Note { get; set; }
    }
} 