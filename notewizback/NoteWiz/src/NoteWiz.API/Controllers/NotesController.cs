using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteWiz.API.DTOs;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using System.Security.Claims;

namespace NoteWiz.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NotesController : ControllerBase
    {
        private readonly INoteService _noteService;
        private readonly IFriendshipService _friendshipService;
        private readonly IUserService _userService;

        public NotesController(INoteService noteService, IFriendshipService friendshipService, IUserService userService)
        {
            _noteService = noteService;
            _friendshipService = friendshipService;
            _userService = userService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                throw new UnauthorizedAccessException("User ID not found in claims");
            }
            return int.Parse(userIdClaim.Value);
        }

        [AllowAnonymous]
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok("Test endpoint works!");
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NoteResponseDTO>>> GetUserNotes()
        {
            var userId = GetCurrentUserId();
            var notes = await _noteService.GetUserNotesAsync(userId);
            var noteDTOs = notes.Select(n => new NoteResponseDTO
            {
                Id = n.Id,
                Title = n.Title,
                Content = n.Content,
                IsPrivate = n.IsPrivate,
                Color = n.Color ?? "#FFFFFF",
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt,
                CoverImage = n.CoverImageUrl,
                SharedWith = n.SharedWith?.Select(sw => new NoteShareResponseDTO
                {
                    Id = sw.Id,
                    NoteId = sw.NoteId,
                    SharedWithUserId = sw.SharedWithUserId,
                    SharedWithUserEmail = sw.SharedWithUser?.Email ?? string.Empty,
                    CanEdit = sw.CanEdit,
                    SharedAt = sw.SharedAt,
                    SharedWithUser = sw.SharedWithUser != null ? new UserResponseDTO
                    {
                        Id = sw.SharedWithUser.Id,
                        Username = sw.SharedWithUser.Username,
                        Email = sw.SharedWithUser.Email,
                        FullName = sw.SharedWithUser.FullName,
                        CreatedAt = sw.SharedWithUser.CreatedAt
                    } : null
                }).ToList() ?? new List<NoteShareResponseDTO>()
            });
            return Ok(noteDTOs);
        }

        [HttpGet("friends")]
        public async Task<ActionResult<IEnumerable<NoteResponseDTO>>> GetFriendsNotes()
        {
            var userId = GetCurrentUserId();
            var notes = await _noteService.GetFriendsNotesAsync(userId);
            var noteDTOs = notes.Select(n => new NoteResponseDTO
            {
                Id = n.Id,
                Title = n.Title,
                Content = n.Content,
                IsPrivate = n.IsPrivate,
                Color = n.Color ?? "#FFFFFF",
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt,
                CoverImage = n.CoverImageUrl,
                SharedWith = n.SharedWith?.Select(sw => new NoteShareResponseDTO
                {
                    Id = sw.Id,
                    NoteId = sw.NoteId,
                    SharedWithUserId = sw.SharedWithUserId,
                    SharedWithUserEmail = sw.SharedWithUser?.Email ?? string.Empty,
                    CanEdit = sw.CanEdit,
                    SharedAt = sw.SharedAt,
                    SharedWithUser = sw.SharedWithUser != null ? new UserResponseDTO
                    {
                        Id = sw.SharedWithUser.Id,
                        Username = sw.SharedWithUser.Username,
                        Email = sw.SharedWithUser.Email,
                        FullName = sw.SharedWithUser.FullName,
                        CreatedAt = sw.SharedWithUser.CreatedAt
                    } : null
                }).ToList() ?? new List<NoteShareResponseDTO>()
            });
            return Ok(noteDTOs);
        }

        [HttpGet("shared")]
        public async Task<ActionResult<IEnumerable<NoteResponseDTO>>> GetSharedNotes()
        {
            var userId = GetCurrentUserId();
            var notes = await _noteService.GetSharedNotesAsync(userId);
            var noteDTOs = notes.Select(n => new NoteResponseDTO
            {
                Id = n.Id,
                Title = n.Title,
                Content = n.Content,
                IsPrivate = n.IsPrivate,
                Color = n.Color ?? "#FFFFFF",
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt,
                CoverImage = n.CoverImageUrl,
                SharedWith = n.SharedWith?.Select(sw => new NoteShareResponseDTO
                {
                    Id = sw.Id,
                    NoteId = sw.NoteId,
                    SharedWithUserId = sw.SharedWithUserId,
                    SharedWithUserEmail = sw.SharedWithUser?.Email ?? string.Empty,
                    CanEdit = sw.CanEdit,
                    SharedAt = sw.SharedAt,
                    SharedWithUser = sw.SharedWithUser != null ? new UserResponseDTO
                    {
                        Id = sw.SharedWithUser.Id,
                        Username = sw.SharedWithUser.Username,
                        Email = sw.SharedWithUser.Email,
                        FullName = sw.SharedWithUser.FullName,
                        CreatedAt = sw.SharedWithUser.CreatedAt
                    } : null
                }).ToList() ?? new List<NoteShareResponseDTO>()
            });
            return Ok(noteDTOs);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NoteResponseDTO>> GetNote(int id)
        {
            var userId = GetCurrentUserId();
            var note = await _noteService.GetNoteByIdAsync(id);

            if (note == null)
                return NotFound();

            if (note.UserId != userId && note.IsPrivate)
            {
                var shares = await _noteService.GetNoteSharesAsync(id, userId);
                if (!shares.Any())
                    return Forbid();
            }

            bool isPdf = false;
            string? pdfUrl = null;
            int? documentId = note.DocumentId;
            if (note.DocumentId.HasValue && note.Document != null)
            {
                isPdf = note.Document.FileName?.ToLower().EndsWith(".pdf") == true;
                pdfUrl = $"/api/document/file/{note.Document.FileName}";
            }

            return Ok(new NoteResponseDTO
            {
                Id = note.Id,
                Title = note.Title,
                Content = note.Content,
                IsPrivate = note.IsPrivate,
                Color = note.Color ?? "#FFFFFF",
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt,
                CoverImage = note.CoverImageUrl,
                SharedWith = note.SharedWith?.Select(sw => new NoteShareResponseDTO
                {
                    Id = sw.Id,
                    NoteId = sw.NoteId,
                    SharedWithUserId = sw.SharedWithUserId,
                    SharedWithUserEmail = sw.SharedWithUser?.Email ?? string.Empty,
                    CanEdit = sw.CanEdit,
                    SharedAt = sw.SharedAt,
                    SharedWithUser = sw.SharedWithUser != null ? new UserResponseDTO
                    {
                        Id = sw.SharedWithUser.Id,
                        Username = sw.SharedWithUser.Username,
                        Email = sw.SharedWithUser.Email,
                        FullName = sw.SharedWithUser.FullName,
                        CreatedAt = sw.SharedWithUser.CreatedAt
                    } : null
                }).ToList() ?? new List<NoteShareResponseDTO>(),
                IsPdf = isPdf,
                PdfUrl = pdfUrl,
                DocumentId = documentId
            });
        }

        [HttpPost]
        public async Task<ActionResult<NoteResponseDTO>> CreateNote(NoteCreateDTO noteDTO)
        {
            var userId = GetCurrentUserId();
            var note = new Note
            {
                Title = noteDTO.Title,
                Content = noteDTO.Content,
                IsPrivate = noteDTO.IsPrivate,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                CoverImageUrl = noteDTO.CoverImage
            };

            note = await _noteService.CreateNoteAsync(note);

            return CreatedAtAction(nameof(GetNote), new { id = note.Id }, new NoteResponseDTO
            {
                Id = note.Id,
                Title = note.Title,
                Content = note.Content,
                IsPrivate = note.IsPrivate,
                Color = note.Color ?? "#FFFFFF",
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt,
                CoverImage = note.CoverImageUrl,
                SharedWith = note.SharedWith?.Select(sw => new NoteShareResponseDTO
                {
                    Id = sw.Id,
                    NoteId = sw.NoteId,
                    SharedWithUserId = sw.SharedWithUserId,
                    SharedWithUserEmail = sw.SharedWithUser?.Email ?? string.Empty,
                    CanEdit = sw.CanEdit,
                    SharedAt = sw.SharedAt,
                    SharedWithUser = sw.SharedWithUser != null ? new UserResponseDTO
                    {
                        Id = sw.SharedWithUser.Id,
                        Username = sw.SharedWithUser.Username,
                        Email = sw.SharedWithUser.Email,
                        FullName = sw.SharedWithUser.FullName,
                        CreatedAt = sw.SharedWithUser.CreatedAt
                    } : null
                }).ToList() ?? new List<NoteShareResponseDTO>()
            });
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<NoteResponseDTO>> UpdateNote(int id, NoteUpdateDTO noteDTO)
        {
            var userId = GetCurrentUserId();
            var note = await _noteService.GetNoteByIdAsync(id);

            if (note == null)
                return NotFound();

            if (note.UserId != userId)
            {
                var shares = await _noteService.GetNoteSharesAsync(id, userId);
                if (!shares.Any(s => s.CanEdit))
                    return Forbid();
            }

            note.Title = noteDTO.Title;
            note.Content = noteDTO.Content;
            note.IsPrivate = noteDTO.IsPrivate;
            note.UpdatedAt = DateTime.UtcNow;
            note.CoverImageUrl = noteDTO.CoverImage;

            note = await _noteService.UpdateNoteAsync(note);

            return Ok(new NoteResponseDTO
            {
                Id = note.Id,
                Title = note.Title,
                Content = note.Content,
                IsPrivate = note.IsPrivate,
                Color = note.Color ?? "#FFFFFF",
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt,
                CoverImage = note.CoverImageUrl,
                SharedWith = note.SharedWith?.Select(sw => new NoteShareResponseDTO
                {
                    Id = sw.Id,
                    NoteId = sw.NoteId,
                    SharedWithUserId = sw.SharedWithUserId,
                    SharedWithUserEmail = sw.SharedWithUser?.Email ?? string.Empty,
                    CanEdit = sw.CanEdit,
                    SharedAt = sw.SharedAt,
                    SharedWithUser = sw.SharedWithUser != null ? new UserResponseDTO
                    {
                        Id = sw.SharedWithUser.Id,
                        Username = sw.SharedWithUser.Username,
                        Email = sw.SharedWithUser.Email,
                        FullName = sw.SharedWithUser.FullName,
                        CreatedAt = sw.SharedWithUser.CreatedAt
                    } : null
                }).ToList() ?? new List<NoteShareResponseDTO>()
            });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteNote(int id)
        {
            var userId = GetCurrentUserId();
            var note = await _noteService.GetNoteByIdAsync(id);

            if (note == null)
                return NotFound();

            if (note.UserId != userId)
                return Forbid();

            await _noteService.DeleteNoteAsync(note);

            return NoContent();
        }

        [HttpPost("{id}/share")]
        public async Task<ActionResult<NoteShareResponseDTO>> ShareNote(int id, NoteShareCreateDTO shareDTO)
        {
            var userId = GetCurrentUserId();
            var note = await _noteService.GetNoteByIdAsync(id);

            if (note == null)
                return NotFound();

            if (note.UserId != userId)
                return Forbid();

            var sharedWithUser = await _userService.GetUserByEmailAsync(shareDTO.SharedWithUserEmail);
            if (sharedWithUser == null)
                return BadRequest("User not found");

            await _noteService.ShareNoteAsync(note, sharedWithUser.Id, shareDTO.CanEdit);

            var shares = await _noteService.GetNoteSharesAsync(id, sharedWithUser.Id);
            var share = shares.First();

            return Ok(new NoteShareResponseDTO
            {
                Id = share.Id,
                NoteId = share.NoteId,
                SharedWithUserId = share.SharedWithUserId,
                SharedWithUserEmail = sharedWithUser.Email,
                CanEdit = share.CanEdit,
                SharedAt = share.SharedAt,
                SharedWithUser = new UserResponseDTO
                {
                    Id = sharedWithUser.Id,
                    Username = sharedWithUser.Username,
                    Email = sharedWithUser.Email,
                    FullName = sharedWithUser.FullName,
                    CreatedAt = sharedWithUser.CreatedAt
                }
            });
        }
    }
} 