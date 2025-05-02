using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Application.Services
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
            if (note == null || (note.UserId != userId && !await HasAccessToNote(userId, id)))
                return null;
            return note;
        }

        public async Task<IEnumerable<Note>> GetUserNotesAsync(int userId)
        {
            return await _noteRepository.GetUserNotesAsync(userId);
        }

        public async Task<Note> CreateNoteAsync(Note note)
        {
            note.CreatedAt = System.DateTime.UtcNow;
            return await _noteRepository.AddAsync(note);
        }

        public async Task<Note> UpdateNoteAsync(Note note)
        {
            var existingNote = await _noteRepository.GetByIdAsync(note.Id);
            if (existingNote == null || existingNote.UserId != note.UserId)
                return null;

            note.UpdatedAt = System.DateTime.UtcNow;
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
            var note = await _noteRepository.GetByIdAsync(noteId);
            if (note == null || note.UserId != userId)
                return false;

            var noteShare = new NoteShare
            {
                NoteId = noteId,
                SharedWithUserId = sharedWithUserId,
                CanEdit = canEdit
            };

            await _noteRepository.AddNoteShareAsync(noteShare);
            return true;
        }

        public async Task<IEnumerable<Note>> GetSharedNotesAsync(int userId)
        {
            return await _noteRepository.GetSharedNotesAsync(userId);
        }

        public async Task<IEnumerable<NoteShare>> GetNoteSharesAsync(int noteId, int? userId = null)
        {
            if (userId.HasValue)
                return await _noteRepository.GetNoteSharesByNoteIdAndUserIdAsync(noteId, userId.Value);
            else
                return await _noteRepository.GetNoteSharesByNoteIdAsync(noteId);
        }

        private async Task<bool> HasAccessToNote(int userId, int noteId)
        {
            var noteShare = await _noteRepository.GetNoteShareAsync(noteId, userId);
            return noteShare != null;
        }
    }
} 