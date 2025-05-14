using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using NoteWiz.Core.Enums;
using NoteWiz.Core.DTOs;
using System.Security.Cryptography;
using System.Text;

namespace NoteWiz.Application.Services
{
    public class NoteShareService : INoteShareService
    {
        private readonly INoteShareRepository _noteShareRepository;
        private readonly INoteRepository _noteRepository;
        private readonly IUserRepository _userRepository;
        private readonly string _baseUrl;

        public NoteShareService(INoteShareRepository noteShareRepository, INoteRepository noteRepository, IUserRepository userRepository, string baseUrl)
        {
            _noteShareRepository = noteShareRepository;
            _noteRepository = noteRepository;
            _userRepository = userRepository;
            _baseUrl = baseUrl;
        }

        public async Task<NoteShareResponseDTO> ShareNoteAsync(CreateNoteShareDTO dto)
        {
            var note = await _noteRepository.GetByIdAsync(dto.NoteId);
            if (note == null)
                throw new Exception("Note not found.");

            var noteShare = new NoteShare
            {
                NoteId = dto.NoteId,
                SharedWithUserId = dto.SharedWithUserId,
                SharedWithEmail = dto.SharedWithEmail,
                CanEdit = dto.CanEdit,
                ShareMethod = dto.ShareMethod,
                ExpiresAt = dto.ExpiresAt,
                IsActive = true
            };

            await _noteShareRepository.AddAsync(noteShare);
            return MapToNoteShareResponseDTO(noteShare);
        }

        public async Task<IEnumerable<NoteShareResponseDTO>> GetSharedNotesAsync(int userId)
        {
            var noteShares = await _noteShareRepository.GetNoteSharesByNoteIdAndUserIdAsync(userId, userId);
            return noteShares.Select(MapToNoteShareResponseDTO);
        }

        public async Task<IEnumerable<NoteShareResponseDTO>> GetNotesSharedByMeAsync(int userId)
        {
            var noteShares = await _noteShareRepository.GetNoteSharesByNoteIdAsync(userId);
            return noteShares.Select(MapToNoteShareResponseDTO);
        }

        public async Task<NoteShareResponseDTO> GetSharedNoteByTokenAsync(string token)
        {
            var noteShare = await _noteShareRepository.Query().FirstOrDefaultAsync(ns => ns.ShareToken == token);
            if (noteShare == null)
                throw new Exception("Shared note not found.");

            return MapToNoteShareResponseDTO(noteShare);
        }

        public async Task RemoveShareAsync(int noteShareId)
        {
            var noteShare = await _noteShareRepository.GetByIdAsync(noteShareId);
            if (noteShare == null)
                throw new Exception("Note share not found.");

            await _noteShareRepository.DeleteAsync(noteShare);
        }

        private NoteShareResponseDTO MapToNoteShareResponseDTO(NoteShare noteShare)
        {
            return new NoteShareResponseDTO
            {
                Id = noteShare.Id,
                NoteId = noteShare.NoteId,
                NoteTitle = noteShare.Note.Title,
                SharedWithUserId = noteShare.SharedWithUserId,
                SharedWithEmail = noteShare.SharedWithEmail,
                ShareLink = noteShare.ShareLink,
                CanEdit = noteShare.CanEdit,
                SharedAt = noteShare.SharedAt,
                ExpiresAt = noteShare.ExpiresAt,
                ShareMethod = noteShare.ShareMethod,
                IsActive = noteShare.IsActive,
                SharedWithUser = noteShare.SharedWithUser != null ? new UserResponseDTO
                {
                    Id = noteShare.SharedWithUser.Id,
                    Username = noteShare.SharedWithUser.Username,
                    Email = noteShare.SharedWithUser.Email,
                    FullName = noteShare.SharedWithUser.FullName,
                    CreatedAt = noteShare.SharedWithUser.CreatedAt
                } : null
            };
        }

        private string GenerateShareToken()
        {
            using (var rng = new RNGCryptoServiceProvider())
            {
                var tokenBytes = new byte[32];
                rng.GetBytes(tokenBytes);
                return Convert.ToBase64String(tokenBytes)
                    .Replace("/", "_")
                    .Replace("+", "-")
                    .Replace("=", "");
            }
        }
    }
} 