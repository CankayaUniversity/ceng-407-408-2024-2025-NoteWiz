using Microsoft.EntityFrameworkCore;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using NoteWiz.Infrastructure.Data;

namespace NoteWiz.Infrastructure.Services
{
    public class DrawingService : IDrawingService
    {
        private readonly ApplicationDbContext _context;

        public DrawingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<NoteDrawing> SaveDrawing(int noteId, string drawingData)
        {
            var note = await _context.Notes.FindAsync(noteId);
            if (note == null)
            {
                throw new ArgumentException("Note not found");
            }

            var drawing = new NoteDrawing
            {
                NoteId = noteId,
                DrawingData = drawingData,
                CreatedAt = DateTime.UtcNow
            };

            _context.NoteDrawings.Add(drawing);
            await _context.SaveChangesAsync();

            return drawing;
        }

        public async Task<List<NoteDrawing>> GetDrawings(int noteId)
        {
            return await _context.NoteDrawings
                .Where(d => d.NoteId == noteId)
                .OrderBy(d => d.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> DeleteDrawing(int drawingId)
        {
            var drawing = await _context.NoteDrawings.FindAsync(drawingId);
            if (drawing == null)
            {
                return false;
            }

            _context.NoteDrawings.Remove(drawing);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateDrawing(int drawingId, string drawingData)
        {
            var drawing = await _context.NoteDrawings.FindAsync(drawingId);
            if (drawing == null)
            {
                return false;
            }

            drawing.DrawingData = drawingData;
            await _context.SaveChangesAsync();

            return true;
        }
    }
} 