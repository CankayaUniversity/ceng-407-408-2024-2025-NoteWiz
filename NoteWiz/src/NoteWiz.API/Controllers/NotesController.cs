using System.Collections.Generic;
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

        public NotesController(INoteService noteService)
        {
            _noteService = noteService;
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
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            var userId = int.Parse(userIdClaim.Value);
            var notes = await _noteService.GetUserNotesAsync(userId);
            var noteDtos = notes.Select(n => new NoteResponseDTO
            {
                Id = n.Id,
                Title = n.Title,
                Content = n.Content,
                Tags = n.Tags ?? new List<string>(),
                Color = n.Color,
                IsPinned = n.IsPinned,
                UserId = n.UserId,
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt,
                SharedWith = n.SharedWith?.Select(s => new NoteShareResponseDTO
                {
                    Id = s.Id,
                    NoteId = s.NoteId,
                    SharedWithUserId = s.SharedWithUserId,
                    SharedWithUserEmail = s.SharedWithUser?.Email ?? "Unknown",
                    CanEdit = s.CanEdit,
                    SharedAt = s.SharedAt,
                    SharedWithUser = s.SharedWithUser != null ? new UserResponseDTO
                    {
                        Id = s.SharedWithUser.Id,
                        Username = s.SharedWithUser.Username,
                        Email = s.SharedWithUser.Email,
                        FullName = s.SharedWithUser.FullName,
                        CreatedAt = s.SharedWithUser.CreatedAt
                    } : null!
                }).ToList() ?? new List<NoteShareResponseDTO>()
            });
            return Ok(noteDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NoteResponseDTO>> GetNote(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            var userId = int.Parse(userIdClaim.Value);
            var note = await _noteService.GetNoteByIdAsync(id, userId);
            
            if (note == null)
                return NotFound();

            var noteDto = new NoteResponseDTO
            {
                Id = note.Id,
                Title = note.Title,
                Content = note.Content,
                Tags = note.Tags ?? new List<string>(),
                Color = note.Color,
                IsPinned = note.IsPinned,
                UserId = note.UserId,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt,
                SharedWith = note.SharedWith?.Select(s => new NoteShareResponseDTO
                {
                    Id = s.Id,
                    NoteId = s.NoteId,
                    SharedWithUserId = s.SharedWithUserId,
                    SharedWithUserEmail = s.SharedWithUser?.Email ?? "Unknown",
                    CanEdit = s.CanEdit,
                    SharedAt = s.SharedAt,
                    SharedWithUser = s.SharedWithUser != null ? new UserResponseDTO
                    {
                        Id = s.SharedWithUser.Id,
                        Username = s.SharedWithUser.Username,
                        Email = s.SharedWithUser.Email,
                        FullName = s.SharedWithUser.FullName,
                        CreatedAt = s.SharedWithUser.CreatedAt
                    } : null!
                }).ToList() ?? new List<NoteShareResponseDTO>()
            };

            return Ok(noteDto);
        }

        [HttpPost]
        public async Task<ActionResult<NoteResponseDTO>> CreateNote([FromBody] CreateNoteDTO dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            var userId = int.Parse(userIdClaim.Value);
            
            var note = new Note
            {
                Title = dto.Title,
                Content = dto.Content,
                Tags = dto.Tags ?? new List<string>(),
                Color = dto.Color,
                IsPinned = dto.IsPinned,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };
            
            var createdNote = await _noteService.CreateNoteAsync(note);
            
            var responseDto = new NoteResponseDTO
            {
                Id = createdNote.Id,
                Title = createdNote.Title,
                Content = createdNote.Content,
                Tags = createdNote.Tags ?? new List<string>(),
                Color = createdNote.Color,
                IsPinned = createdNote.IsPinned,
                UserId = createdNote.UserId,
                CreatedAt = createdNote.CreatedAt,
                UpdatedAt = createdNote.UpdatedAt,
                SharedWith = new List<NoteShareResponseDTO>()
            };

            return CreatedAtAction(nameof(GetNote), new { id = responseDto.Id }, responseDto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<NoteResponseDTO>> UpdateNote(int id, [FromBody] UpdateNoteDTO dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            var userId = int.Parse(userIdClaim.Value);
            
            var existingNote = await _noteService.GetNoteByIdAsync(id, userId);
            if (existingNote == null)
                return NotFound();

            existingNote.Title = dto.Title;
            existingNote.Content = dto.Content;
            existingNote.Tags = dto.Tags ?? new List<string>();
            existingNote.Color = dto.Color;
            existingNote.IsPinned = dto.IsPinned;
            existingNote.UpdatedAt = DateTime.UtcNow;

            var updatedNote = await _noteService.UpdateNoteAsync(existingNote);
            
            var responseDto = new NoteResponseDTO
            {
                Id = updatedNote.Id,
                Title = updatedNote.Title,
                Content = updatedNote.Content,
                Tags = updatedNote.Tags ?? new List<string>(),
                Color = updatedNote.Color,
                IsPinned = updatedNote.IsPinned,
                UserId = updatedNote.UserId,
                CreatedAt = updatedNote.CreatedAt,
                UpdatedAt = updatedNote.UpdatedAt,
                SharedWith = updatedNote.SharedWith?.Select(s => new NoteShareResponseDTO
                {
                    Id = s.Id,
                    NoteId = s.NoteId,
                    SharedWithUserId = s.SharedWithUserId,
                    SharedWithUserEmail = s.SharedWithUser?.Email ?? "Unknown",
                    CanEdit = s.CanEdit,
                    SharedAt = s.SharedAt,
                    SharedWithUser = s.SharedWithUser != null ? new UserResponseDTO
                    {
                        Id = s.SharedWithUser.Id,
                        Username = s.SharedWithUser.Username,
                        Email = s.SharedWithUser.Email,
                        FullName = s.SharedWithUser.FullName,
                        CreatedAt = s.SharedWithUser.CreatedAt
                    } : null!
                }).ToList() ?? new List<NoteShareResponseDTO>()
            };

            return Ok(responseDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            var userId = int.Parse(userIdClaim.Value);
            var success = await _noteService.DeleteNoteAsync(id, userId);
            
            if (!success)
                return NotFound();

            return NoContent();
        }

        [HttpPost("{id}/share")]
        public async Task<IActionResult> ShareNote(int id, [FromBody] NoteShareDTO dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            var userId = int.Parse(userIdClaim.Value);
            var success = await _noteService.ShareNoteAsync(id, userId, dto.SharedWithUserId, dto.CanEdit);
            
            if (!success)
                return NotFound();

            return Ok();
        }

        [HttpGet("shared")]
        public async Task<ActionResult<IEnumerable<NoteResponseDTO>>> GetSharedNotes()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            var userId = int.Parse(userIdClaim.Value);
            var notes = await _noteService.GetSharedNotesAsync(userId);
            
            var noteDtos = notes.Select(n => new NoteResponseDTO
            {
                Id = n.Id,
                Title = n.Title,
                Content = n.Content,
                Tags = n.Tags ?? new List<string>(),
                Color = n.Color,
                IsPinned = n.IsPinned,
                UserId = n.UserId,
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt,
                SharedWith = n.SharedWith?.Select(s => new NoteShareResponseDTO
                {
                    Id = s.Id,
                    NoteId = s.NoteId,
                    SharedWithUserId = s.SharedWithUserId,
                    SharedWithUserEmail = s.SharedWithUser?.Email ?? "Unknown",
                    CanEdit = s.CanEdit,
                    SharedAt = s.SharedAt,
                    SharedWithUser = s.SharedWithUser != null ? new UserResponseDTO
                    {
                        Id = s.SharedWithUser.Id,
                        Username = s.SharedWithUser.Username,
                        Email = s.SharedWithUser.Email,
                        FullName = s.SharedWithUser.FullName,
                        CreatedAt = s.SharedWithUser.CreatedAt
                    } : null!
                }).ToList() ?? new List<NoteShareResponseDTO>()
            });

            return Ok(noteDtos);
        }
    }
} 