using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using NoteWiz.Core.Enums;

namespace NoteWiz.Core.Services
{
    public class NoteService : INoteService
    {
        private readonly INoteRepository _noteRepository;

        public NoteService(INoteRepository noteRepository)
        {
            _noteRepository = noteRepository;
        }

        public async Task<Note> GetNoteByIdAsync(int id, int userId)
        {
            return await _noteRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Note>> GetUserNotesAsync(int userId)
        {
            return await _noteRepository.GetUserNotesAsync(userId);
        }

        public async Task<Note> CreateNoteAsync(Note note)
        {
            return await _noteRepository.AddAsync(note);
        }

        public async Task<Note> UpdateNoteAsync(Note note)
        {
            return await _noteRepository.UpdateAsync(note);
        }

        public async Task<bool> DeleteNoteAsync(int id, int userId)
        {
            var note = await _noteRepository.GetByIdAsync(id);
            if (note == null || note.UserId != userId)
                return false;

            await _noteRepository.DeleteAsync(note);
            return true;
        }

        public async Task<bool> ShareNoteAsync(int noteId, int userId, int sharedWithUserId, bool canEdit)
        {
            var noteShare = new NoteShare
            {
                NoteId = noteId,
                SharedWithUserId = sharedWithUserId,
                CanEdit = canEdit,
                SharedAt = DateTime.UtcNow
            };
            return await _noteRepository.AddNoteShareAsync(noteShare);
        }

        public async Task<IEnumerable<Note>> GetSharedNotesAsync(int userId)
        {
            return await _noteRepository.GetSharedNotesAsync(userId);
        }

        public async Task<IEnumerable<NoteShare>> GetNoteSharesAsync(int noteId, int? userId = null)
        {
            if (userId.HasValue)
                return await _noteRepository.GetNoteSharesByNoteIdAndUserIdAsync(noteId, userId.Value);
            return await _noteRepository.GetNoteSharesByNoteIdAsync(noteId);
        }

        public async Task<Note> UpdateNoteCoverAsync(int noteId, int userId, CoverType coverType, string? coverColor, string? coverImageUrl, CoverPosition coverPosition)
        {
            var note = await _noteRepository.GetByIdAsync(noteId);
            if (note == null || note.UserId != userId)
                return null;

            return await _noteRepository.UpdateCoverAsync(noteId, coverType, coverColor, coverImageUrl, coverPosition);
        }

        public async Task<bool> RemoveNoteCoverAsync(int noteId, int userId)
        {
            var note = await _noteRepository.GetByIdAsync(noteId);
            if (note == null || note.UserId != userId)
                return false;

            return await _noteRepository.RemoveCoverAsync(noteId);
        }

        public async Task<IEnumerable<Note>> GetNotesByCoverTypeAsync(int userId, CoverType coverType)
        {
            return await _noteRepository.GetNotesByCoverTypeAsync(userId, coverType);
        }

        public async Task<NoteDrawing> AddNoteDrawingAsync(int noteId, int userId, string drawingData, string position)
        {
            var drawing = new NoteDrawing
            {
                NoteId = noteId,
                DrawingData = drawingData,
                Position = position,
                CreatedAt = DateTime.UtcNow
            };
            return await _noteRepository.AddNoteDrawingAsync(drawing);
        }

        public async Task<IEnumerable<NoteDrawing>> GetNoteDrawingsAsync(int noteId, int userId)
        {
            return await _noteRepository.GetNoteDrawingsAsync(noteId);
        }

        public async Task<bool> DeleteNoteDrawingAsync(int noteId, int drawingId, int userId)
        {
            return await _noteRepository.DeleteNoteDrawingAsync(noteId, drawingId);
        }

        public async Task<NoteImage> AddNoteImageAsync(int noteId, int userId, string imageUrl, string position)
        {
            var image = new NoteImage
            {
                NoteId = noteId,
                ImageUrl = imageUrl,
                Position = position,
                UploadedAt = DateTime.UtcNow
            };
            return await _noteRepository.AddNoteImageAsync(image);
        }

        public async Task<IEnumerable<NoteImage>> GetNoteImagesAsync(int noteId, int userId)
        {
            return await _noteRepository.GetNoteImagesAsync(noteId);
        }

        public async Task<bool> DeleteNoteImageAsync(int noteId, int imageId, int userId)
        {
            return await _noteRepository.DeleteNoteImageAsync(noteId, imageId);
        }
    }
} 