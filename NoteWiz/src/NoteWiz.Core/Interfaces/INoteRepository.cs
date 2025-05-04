using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    public interface INoteRepository : IGenericRepository<Note>
    {
        Task<IEnumerable<Note>> GetUserNotesAsync(int userId);
        Task<IEnumerable<Note>> GetSharedNotesAsync(int userId);
        Task<Note> AddAsync(Note note);
        Task<Note> UpdateAsync(Note note);
        Task DeleteAsync(Note note);
        Task<bool> AddNoteShareAsync(NoteShare noteShare);
        Task<NoteShare> GetNoteShareAsync(int noteId, int userId);
        Task<IEnumerable<NoteShare>> GetNoteSharesByNoteIdAndUserIdAsync(int noteId, int userId);
        Task<IEnumerable<NoteShare>> GetNoteSharesByNoteIdAsync(int noteId);
    }
} 