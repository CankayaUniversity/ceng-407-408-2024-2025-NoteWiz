using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    public interface IDrawingService
    {
        Task<NoteDrawing> SaveDrawing(int noteId, string drawingData);
        Task<List<NoteDrawing>> GetDrawings(int noteId);
        Task<bool> DeleteDrawing(int drawingId);
        Task<bool> UpdateDrawing(int drawingId, string drawingData);
    }
} 