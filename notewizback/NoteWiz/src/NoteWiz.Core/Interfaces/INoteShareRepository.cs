using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    public interface INoteShareRepository : IGenericRepository<NoteShare>
    {
        Task<IEnumerable<NoteShare>> GetNoteSharesByNoteIdAsync(int noteId);
        Task<IEnumerable<NoteShare>> GetNoteSharesByNoteIdAndUserIdAsync(int noteId, int userId);
    }
} 