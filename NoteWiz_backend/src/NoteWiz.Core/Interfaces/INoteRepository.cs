using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Enums;

namespace NoteWiz.Core.Interfaces
{
    public interface INoteRepository
    {
        Task<Note> GetByIdAsync(int id);
        Task<IEnumerable<Note>> GetUserNotesAsync(int userId);
        Task<Note> AddAsync(Note note);
        Task<Note> UpdateAsync(Note note);
        Task DeleteAsync(Note note);
        Task<bool> AddNoteShareAsync(NoteShare noteShare);
        Task<NoteShare> GetNoteShareAsync(int noteId, int userId);
        Task<IEnumerable<Note>> GetSharedNotesAsync(int userId);
        Task<IEnumerable<NoteShare>> GetNoteSharesByNoteIdAndUserIdAsync(int noteId, int userId);
        Task<IEnumerable<NoteShare>> GetNoteSharesByNoteIdAsync(int noteId);
        
        // Cover-related methods
        Task<Note> UpdateCoverAsync(int noteId, CoverType coverType, string? coverColor, string? coverImageUrl, CoverPosition coverPosition);
        Task<bool> RemoveCoverAsync(int noteId);
        Task<IEnumerable<Note>> GetNotesByCoverTypeAsync(int userId, CoverType coverType);

        // Image-related methods
        Task<NoteImage> AddNoteImageAsync(NoteImage noteImage);
        Task<IEnumerable<NoteImage>> GetNoteImagesAsync(int noteId);
        Task<bool> DeleteNoteImageAsync(int noteId, int imageId);

        // Drawing-related methods
        Task<NoteDrawing> AddNoteDrawingAsync(NoteDrawing noteDrawing);
        Task<IEnumerable<NoteDrawing>> GetNoteDrawingsAsync(int noteId);
        Task<bool> DeleteNoteDrawingAsync(int noteId, int drawingId);
    }
} 