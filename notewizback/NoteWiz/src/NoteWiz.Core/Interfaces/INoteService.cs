using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    public interface INoteService
    {
        Task<Note> GetNoteByIdAsync(int id);
        Task<IEnumerable<Note>> GetUserNotesAsync(int userId);
        Task<IEnumerable<Note>> GetFriendsNotesAsync(int userId);
        Task<Note> CreateNoteAsync(Note note);
        Task<Note> UpdateNoteAsync(Note note);
        Task DeleteNoteAsync(Note note);
        Task ShareNoteAsync(Note note, int sharedWithUserId, bool canEdit);
        Task<IEnumerable<Note>> GetSharedNotesAsync(int userId);
        Task<IEnumerable<NoteShare>> GetNoteSharesAsync(int noteId, int? userId = null);
        Task ShareNoteWithEmailAsync(Note note, int? sharedWithUserId, string sharedWithEmail, bool canEdit);
    }
} 