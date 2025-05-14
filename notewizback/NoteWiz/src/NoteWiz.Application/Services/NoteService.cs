using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using NoteWiz.Infrastructure.Data;

namespace NoteWiz.Application.Services
{
    public class NoteService : INoteService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFriendshipService _friendshipService;

        public NoteService(IUnitOfWork unitOfWork, IFriendshipService friendshipService)
        {
            _unitOfWork = unitOfWork;
            _friendshipService = friendshipService;
        }

        public async Task<Note> GetNoteByIdAsync(int id)
        {
            return await _unitOfWork.Notes.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Note>> GetUserNotesAsync(int userId)
        {
            return await _unitOfWork.Notes.GetUserNotesAsync(userId);
        }

        public async Task<IEnumerable<Note>> GetFriendsNotesAsync(int userId)
        {
            var friends = await _unitOfWork.Friendships.GetUserFriendshipsAsync(userId);
            var friendIds = friends.Select(f => f.UserId == userId ? f.FriendId : f.UserId).ToList();
            
            var publicNotes = new List<Note>();
            foreach (var friendId in friendIds)
            {
                var friendNotes = await _unitOfWork.Notes.GetUserNotesAsync(friendId);
                publicNotes.AddRange(friendNotes.Where(n => !n.IsPrivate));
            }

            return publicNotes;
        }

        public async Task<Note> CreateNoteAsync(Note note)
        {
            await _unitOfWork.Notes.AddAsync(note);
            await _unitOfWork.SaveChangesAsync();
            return note;
        }

        public async Task<Note> UpdateNoteAsync(Note note)
        {
            _unitOfWork.Notes.Update(note);
            await _unitOfWork.SaveChangesAsync();
            return note;
        }

        public async Task DeleteNoteAsync(Note note)
        {
            _unitOfWork.Notes.Remove(note);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task ShareNoteAsync(Note note, int sharedWithUserId, bool canEdit)
        {
            var share = new NoteShare
            {
                NoteId = note.Id,
                SharedWithUserId = sharedWithUserId,
                CanEdit = canEdit,
                SharedAt = DateTime.UtcNow
            };

            await _unitOfWork.NoteShares.AddAsync(share);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<IEnumerable<Note>> GetSharedNotesAsync(int userId)
        {
            return await _unitOfWork.Notes.GetSharedNotesAsync(userId);
        }

        public async Task<IEnumerable<NoteShare>> GetNoteSharesAsync(int noteId, int? userId = null)
        {
            if (userId.HasValue)
                return await _unitOfWork.NoteShares.GetNoteSharesByNoteIdAndUserIdAsync(noteId, userId.Value);
            else
                return await _unitOfWork.NoteShares.GetNoteSharesByNoteIdAsync(noteId);
        }

        public async Task ShareNoteWithEmailAsync(Note note, int? sharedWithUserId, string sharedWithEmail, bool canEdit)
        {
            var share = new NoteShare
            {
                NoteId = note.Id,
                SharedWithUserId = sharedWithUserId,
                SharedWithEmail = sharedWithEmail,
                CanEdit = canEdit,
                SharedAt = DateTime.UtcNow
            };

            await _unitOfWork.NoteShares.AddAsync(share);
            await _unitOfWork.SaveChangesAsync();
        }
    }
} 