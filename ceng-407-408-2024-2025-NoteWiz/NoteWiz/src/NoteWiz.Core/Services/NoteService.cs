using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Services
{
    public class NoteService : INoteService
    {
        private readonly INoteRepository _noteRepository;
        private readonly IUserRepository _userRepository;

        public NoteService(INoteRepository noteRepository, IUserRepository userRepository)
        {
            _noteRepository = noteRepository;
            _userRepository = userRepository;
        }

        public async Task<Note> GetNoteByIdAsync(int id, int userId)
        {
            var note = await _noteRepository.GetByIdAsync(id);
            if (note == null || note.UserId != userId)
                return null;

            return note;
        }

        public async Task<IEnumerable<Note>> GetUserNotesAsync(int userId)
        {
            return await _noteRepository.GetUserNotesAsync(userId);
        }

        public async Task<Note> CreateNoteAsync(Note note)
        {
            note.CreatedAt = DateTime.UtcNow;
            note.IsSynced = true;
            note.LastSyncedAt = DateTime.UtcNow;

            return await _noteRepository.AddAsync(note);
        }

        public async Task<Note> UpdateNoteAsync(Note note)
        {
            var existingNote = await _noteRepository.GetByIdAsync(note.Id);
            if (existingNote == null)
                return null;

            existingNote.Title = note.Title;
            existingNote.Content = note.Content;
            existingNote.CoverType = note.CoverType;
            existingNote.CoverColor = note.CoverColor;
            existingNote.CoverImageUrl = note.CoverImageUrl;
            existingNote.CoverPosition = note.CoverPosition;
            existingNote.IsPinned = note.IsPinned;
            existingNote.IsArchived = note.IsArchived;
            existingNote.Tags = note.Tags;
            existingNote.UpdatedAt = DateTime.UtcNow;
            existingNote.IsSynced = true;
            existingNote.LastSyncedAt = DateTime.UtcNow;

            return await _noteRepository.UpdateAsync(existingNote);
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
            var note = await _noteRepository.GetByIdAsync(noteId);
            if (note == null || note.UserId != userId)
                return false;

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
            return await _noteRepository.GetNoteSharesByNoteIdAsync(noteId);
        }

        // Cover-related methods implementation
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
    }
} 