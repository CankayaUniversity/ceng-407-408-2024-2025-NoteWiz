using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using NoteWiz.Infrastructure.Data;
using NoteWiz.Core.Enums;

namespace NoteWiz.Infrastructure.Repositories
{
    public class NoteRepository : INoteRepository
    {
        private readonly ApplicationDbContext _context;

        public NoteRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Note> GetByIdAsync(int id)
        {
            return await _context.Notes
                .Include(n => n.User)
                .Include(n => n.SharedWith)
                .Include(n => n.NoteDrawings)
                .Include(n => n.NoteImages)
                .FirstOrDefaultAsync(n => n.Id == id);
        }

        public async Task<IEnumerable<Note>> GetUserNotesAsync(int userId)
        {
            return await _context.Notes
                .Include(n => n.SharedWith)
                .Where(n => n.UserId == userId)
                .ToListAsync();
        }

        public async Task<Note> AddAsync(Note note)
        {
            await _context.Notes.AddAsync(note);
            await _context.SaveChangesAsync();
            return note;
        }

        public async Task<Note> UpdateAsync(Note note)
        {
            _context.Notes.Update(note);
            await _context.SaveChangesAsync();
            return note;
        }

        public async Task DeleteAsync(Note note)
        {
            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> AddNoteShareAsync(NoteShare noteShare)
        {
            await _context.NoteShares.AddAsync(noteShare);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<NoteShare> GetNoteShareAsync(int noteId, int userId)
        {
            return await _context.NoteShares
                .FirstOrDefaultAsync(ns => ns.NoteId == noteId && ns.SharedWithUserId == userId);
        }

        public async Task<IEnumerable<Note>> GetSharedNotesAsync(int userId)
        {
            return await _context.Notes
                .Include(n => n.SharedWith)
                .Where(n => n.SharedWith.Any(s => s.SharedWithUserId == userId))
                .ToListAsync();
        }

        public async Task<IEnumerable<NoteShare>> GetNoteSharesByNoteIdAndUserIdAsync(int noteId, int userId)
        {
            return await _context.NoteShares
                .Where(ns => ns.NoteId == noteId && ns.SharedWithUserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<NoteShare>> GetNoteSharesByNoteIdAsync(int noteId)
        {
            return await _context.NoteShares
                .Where(ns => ns.NoteId == noteId)
                .ToListAsync();
        }

        // Implementing cover-related methods
        public async Task<Note> UpdateCoverAsync(int noteId, CoverType coverType, string? coverColor, string? coverImageUrl, CoverPosition coverPosition)
        {
            var note = await _context.Notes.FindAsync(noteId);
            if (note == null)
                return null;

            note.CoverType = coverType;
            note.CoverColor = coverColor;
            note.CoverImageUrl = coverImageUrl;
            note.CoverPosition = coverPosition;

            _context.Notes.Update(note);
            await _context.SaveChangesAsync();
            return note;
        }

        public async Task<bool> RemoveCoverAsync(int noteId)
        {
            var note = await _context.Notes.FindAsync(noteId);
            if (note == null)
                return false;

            note.CoverType = CoverType.None;
            note.CoverColor = null;
            note.CoverImageUrl = null;
            note.CoverPosition = CoverPosition.Center; // Default position

            _context.Notes.Update(note);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Note>> GetNotesByCoverTypeAsync(int userId, CoverType coverType)
        {
            return await _context.Notes
                .Include(n => n.SharedWith)
                .Where(n => n.UserId == userId && n.CoverType == coverType)
                .ToListAsync();
        }

        // Implementing image-related methods
        public async Task<NoteImage> AddNoteImageAsync(NoteImage noteImage)
        {
            await _context.NoteImages.AddAsync(noteImage);
            await _context.SaveChangesAsync();
            return noteImage;
        }

        public async Task<IEnumerable<NoteImage>> GetNoteImagesAsync(int noteId)
        {
            return await _context.NoteImages
                .Where(img => img.NoteId == noteId)
                .ToListAsync();
        }

        public async Task<bool> DeleteNoteImageAsync(int noteId, int imageId)
        {
            var image = await _context.NoteImages
                .FirstOrDefaultAsync(img => img.Id == imageId && img.NoteId == noteId);
                
            if (image == null)
                return false;

            _context.NoteImages.Remove(image);
            await _context.SaveChangesAsync();
            return true;
        }

        // Implementing drawing-related methods
        public async Task<NoteDrawing> AddNoteDrawingAsync(NoteDrawing noteDrawing)
        {
            await _context.NoteDrawings.AddAsync(noteDrawing);
            await _context.SaveChangesAsync();
            return noteDrawing;
        }

        public async Task<IEnumerable<NoteDrawing>> GetNoteDrawingsAsync(int noteId)
        {
            return await _context.NoteDrawings
                .Where(drawing => drawing.NoteId == noteId)
                .ToListAsync();
        }

        public async Task<bool> DeleteNoteDrawingAsync(int noteId, int drawingId)
        {
            var drawing = await _context.NoteDrawings
                .FirstOrDefaultAsync(d => d.Id == drawingId && d.NoteId == noteId);
                
            if (drawing == null)
                return false;

            _context.NoteDrawings.Remove(drawing);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}