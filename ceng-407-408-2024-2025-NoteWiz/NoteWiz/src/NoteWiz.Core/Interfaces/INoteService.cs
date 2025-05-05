using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Enums;

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
        
        // Cover-related methods
        Task<Note> UpdateNoteCoverAsync(int noteId, int userId, CoverType coverType, string? coverColor, string? coverImageUrl, CoverPosition coverPosition);
        Task<bool> RemoveNoteCoverAsync(int noteId, int userId);
        Task<IEnumerable<Note>> GetNotesByCoverTypeAsync(int userId, CoverType coverType);

        // Drawing-related methods
        Task<NoteDrawing> AddNoteDrawingAsync(int noteId, int userId, string drawingData, string position);
        Task<IEnumerable<NoteDrawing>> GetNoteDrawingsAsync(int noteId, int userId);
        Task<bool> DeleteNoteDrawingAsync(int noteId, int drawingId, int userId);

        // Image-related methods
        Task<NoteImage> AddNoteImageAsync(int noteId, int userId, string imageUrl, string position);
        Task<IEnumerable<NoteImage>> GetNoteImagesAsync(int noteId, int userId);
        Task<bool> DeleteNoteImageAsync(int noteId, int imageId, int userId);
    }
} 