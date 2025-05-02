using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    public interface INoteService
    {
        Task<Note> GetNoteByIdAsync(int id, int userId);
        Task<IEnumerable<Note>> GetUserNotesAsync(int userId);
        Task<Note> CreateNoteAsync(Note note);
        Task<Note> UpdateNoteAsync(Note note);
        Task<bool> DeleteNoteAsync(int id, int userId);
        Task<bool> ShareNoteAsync(int noteId, int userId, int sharedWithUserId, bool canEdit);
        Task<IEnumerable<Note>> GetSharedNotesAsync(int userId);
        Task<IEnumerable<NoteShare>> GetNoteSharesAsync(int noteId, int? userId = null);
    }
} 