using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteWiz.Core.DTOs;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using System.Security.Claims;
using Microsoft.Extensions.Logging;
using AutoMapper;

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
        private readonly ILogger<NotesController> _logger;
        private readonly IMapper _mapper;

        public NotesController(INoteService noteService, IFriendshipService friendshipService, IUserService userService, ILogger<NotesController> logger, IMapper mapper)
        {
            _noteService = noteService;
            _friendshipService = friendshipService;
            _userService = userService;
            _logger = logger;
            _mapper = mapper;
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
            try
            {
                var userId = GetCurrentUserId();
                var notes = await _noteService.GetUserNotesAsync(userId);
                
                if (notes == null)
                {
                    return Ok(new List<NoteResponseDTO>());
                }

                var noteDTOs = notes.Select(n => new NoteResponseDTO
                {
                    Id = n.Id,
                    Title = n.Title ?? string.Empty,
                    Content = n.Content ?? string.Empty,
                    IsPrivate = n.IsPrivate,
                    Color = n.Color ?? "#FFFFFF",
                    CreatedAt = n.CreatedAt,
                    UpdatedAt = n.UpdatedAt,
                    CoverImage = n.CoverImageUrl ?? string.Empty,
                    SharedWith = n.SharedWith?.Select(sw => new NoteShareResponseDTO
                    {
                        Id = sw.Id,
                        NoteId = sw.NoteId,
                        SharedWithUserId = sw.SharedWithUserId,
                        SharedWithEmail = sw.SharedWithUser?.Email ?? string.Empty,
                        CanEdit = sw.CanEdit,
                        SharedAt = sw.SharedAt,
                        SharedWithUser = sw.SharedWithUser != null ? new UserResponseDTO
                        {
                            Id = sw.SharedWithUser.Id,
                            Username = sw.SharedWithUser.Username ?? string.Empty,
                            Email = sw.SharedWithUser.Email ?? string.Empty,
                            FullName = sw.SharedWithUser.FullName ?? string.Empty,
                            CreatedAt = sw.SharedWithUser.CreatedAt
                        } : null
                    }).ToList() ?? new List<NoteShareResponseDTO>()
                }).ToList();

                return Ok(noteDTOs);
            }
            catch (Exception ex)
            {
                // Log the exception here
                return StatusCode(500, new { error = "An error occurred while fetching notes", details = ex.Message });
            }
        }

        [HttpGet("friends")]
        public async Task<ActionResult<IEnumerable<NoteResponseDTO>>> GetFriendsNotes()
        {
            var userId = GetCurrentUserId();
            var notes = await _noteService.GetFriendsNotesAsync(userId);
            var noteDTOs = notes.Select(n => new NoteResponseDTO
            {
                Id = n.Id,
                Title = n.Title ?? string.Empty,
                Content = n.Content ?? string.Empty,
                IsPrivate = n.IsPrivate,
                Color = n.Color ?? "#FFFFFF",
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt,
                CoverImage = n.CoverImageUrl ?? string.Empty,
                SharedWith = n.SharedWith?.Select(sw => new NoteShareResponseDTO
                {
                    Id = sw.Id,
                    NoteId = sw.NoteId,
                    SharedWithUserId = sw.SharedWithUserId,
                    SharedWithEmail = sw.SharedWithUser?.Email ?? string.Empty,
                    CanEdit = sw.CanEdit,
                    SharedAt = sw.SharedAt,
                    SharedWithUser = sw.SharedWithUser != null ? new UserResponseDTO
                    {
                        Id = sw.SharedWithUser.Id,
                        Username = sw.SharedWithUser.Username ?? string.Empty,
                        Email = sw.SharedWithUser.Email ?? string.Empty,
                        FullName = sw.SharedWithUser.FullName ?? string.Empty,
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
                Title = n.Title ?? string.Empty,
                Content = n.Content ?? string.Empty,
                IsPrivate = n.IsPrivate,
                Color = n.Color ?? "#FFFFFF",
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt,
                CoverImage = n.CoverImageUrl ?? string.Empty,
                SharedWith = n.SharedWith?.Select(sw => new NoteShareResponseDTO
                {
                    Id = sw.Id,
                    NoteId = sw.NoteId,
                    SharedWithUserId = sw.SharedWithUserId,
                    SharedWithEmail = sw.SharedWithUser?.Email ?? string.Empty,
                    CanEdit = sw.CanEdit,
                    SharedAt = sw.SharedAt,
                    SharedWithUser = sw.SharedWithUser != null ? new UserResponseDTO
                    {
                        Id = sw.SharedWithUser.Id,
                        Username = sw.SharedWithUser.Username ?? string.Empty,
                        Email = sw.SharedWithUser.Email ?? string.Empty,
                        FullName = sw.SharedWithUser.FullName ?? string.Empty,
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
                Title = note.Title ?? string.Empty,
                Content = note.Content ?? string.Empty,
                IsPrivate = note.IsPrivate,
                Color = note.Color ?? "#FFFFFF",
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt,
                CoverImage = note.CoverImageUrl ?? string.Empty,
                SharedWith = note.SharedWith?.Select(sw => new NoteShareResponseDTO
                {
                    Id = sw.Id,
                    NoteId = sw.NoteId,
                    SharedWithUserId = sw.SharedWithUserId,
                    SharedWithEmail = sw.SharedWithUser?.Email ?? string.Empty,
                    CanEdit = sw.CanEdit,
                    SharedAt = sw.SharedAt,
                    SharedWithUser = sw.SharedWithUser != null ? new UserResponseDTO
                    {
                        Id = sw.SharedWithUser.Id,
                        Username = sw.SharedWithUser.Username ?? string.Empty,
                        Email = sw.SharedWithUser.Email ?? string.Empty,
                        FullName = sw.SharedWithUser.FullName ?? string.Empty,
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
                Color = noteDTO.Color ?? "#FFFFFF",
                CoverImageUrl = noteDTO.CoverImage,
                CategoryId = noteDTO.CategoryId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsOffline = noteDTO.IsOffline,
                SyncStatus = noteDTO.SyncStatus ?? "synced",
                LastModifiedAt = noteDTO.LastModifiedAt ?? DateTime.UtcNow
            };

            var createdNote = await _noteService.CreateNoteAsync(note);
            var responseDTO = _mapper.Map<NoteResponseDTO>(createdNote);
            return CreatedAtAction(nameof(GetNote), new { id = createdNote.Id }, responseDTO);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<NoteResponseDTO>> UpdateNote(int id, NoteUpdateDTO noteDTO)
        {
            var userId = GetCurrentUserId();
            var existingNote = await _noteService.GetNoteByIdAsync(id);

            if (existingNote == null)
                return NotFound();

            if (existingNote.UserId != userId)
                return Forbid();

            // AutoMapper ile güncelle
            _mapper.Map(noteDTO, existingNote);
            
            var updatedNote = await _noteService.UpdateNoteAsync(existingNote);
            var responseDTO = _mapper.Map<NoteResponseDTO>(updatedNote);
            return Ok(responseDTO);
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
        public async Task<ActionResult<NoteShareResponseDTO>> ShareNote(int id, CreateNoteShareDTO shareDTO)
        {
            var userId = GetCurrentUserId();
            var note = await _noteService.GetNoteByIdAsync(id);

            if (note == null)
                return NotFound();

            if (note.UserId != userId)
                return Forbid();

            if (!string.IsNullOrEmpty(shareDTO.SharedWithEmail))
            {
                var sharedWithUser = await _userService.GetUserByEmailAsync(shareDTO.SharedWithEmail);
                int? sharedWithUserId = sharedWithUser?.Id;

                await _noteService.ShareNoteWithEmailAsync(note, sharedWithUserId, shareDTO.SharedWithEmail, shareDTO.CanEdit);
            }
            else if (shareDTO.SharedWithUserId.HasValue)
            {
                await _noteService.ShareNoteAsync(note, shareDTO.SharedWithUserId.Value, shareDTO.CanEdit);
            }
            else
            {
                return BadRequest("No recipient specified");
            }

            var shares = await _noteService.GetNoteSharesAsync(id, null);
            var share = shares.OrderByDescending(s => s.SharedAt).First();

            return Ok(new NoteShareResponseDTO
            {
                Id = share.Id,
                NoteId = share.NoteId,
                SharedWithUserId = share.SharedWithUserId,
                SharedWithEmail = share.SharedWithEmail,
                CanEdit = share.CanEdit,
                SharedAt = share.SharedAt,
                SharedWithUser = share.SharedWithUser != null ? new UserResponseDTO
                {
                    Id = share.SharedWithUser.Id,
                    Username = share.SharedWithUser.Username,
                    Email = share.SharedWithUser.Email,
                    FullName = share.SharedWithUser.FullName,
                    CreatedAt = share.SharedWithUser.CreatedAt
                } : null
            });
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<NoteResponseDTO>>> GetUserNotes(int userId)
        {
            try
            {
                var notes = await _noteService.GetUserNotesAsync(userId);
                if (notes == null || !notes.Any())
                {
                    return Ok(new List<NoteResponseDTO>());
                }

                var noteDtos = notes.Select(n => new NoteResponseDTO
                {
                    Id = n.Id,
                    Title = n.Title ?? string.Empty,
                    Content = n.Content ?? string.Empty,
                    UserId = n.UserId,
                    DocumentId = n.DocumentId,
                    Color = n.Color ?? "#FFFFFF",
                    IsPinned = n.IsPinned,
                    IsPrivate = n.IsPrivate,
                    CoverImage = n.CoverImageUrl ?? string.Empty,
                    Tags = n.Tags ?? new List<string>(),
                    CategoryId = n.CategoryId,
                    CreatedAt = n.CreatedAt,
                    UpdatedAt = n.UpdatedAt,
                    IsSynced = n.IsSynced,
                    LastSyncedAt = n.LastSyncedAt,
                    User = n.User != null ? new UserResponseDTO
                    {
                        Id = n.User.Id,
                        Username = n.User.Username ?? string.Empty,
                        Email = n.User.Email ?? string.Empty,
                        FullName = n.User.FullName ?? string.Empty,
                        CreatedAt = n.User.CreatedAt
                    } : null,
                    SharedWith = n.SharedWith?.Select(sw => new NoteShareResponseDTO
                    {
                        Id = sw.Id,
                        NoteId = sw.NoteId,
                        SharedWithUserId = sw.SharedWithUserId,
                        SharedWithEmail = sw.SharedWithUser?.Email ?? string.Empty,
                        CanEdit = sw.CanEdit,
                        SharedAt = sw.SharedAt,
                        SharedWithUser = sw.SharedWithUser != null ? new UserResponseDTO
                        {
                            Id = sw.SharedWithUser.Id,
                            Username = sw.SharedWithUser.Username ?? string.Empty,
                            Email = sw.SharedWithUser.Email ?? string.Empty,
                            FullName = sw.SharedWithUser.FullName ?? string.Empty,
                            CreatedAt = sw.SharedWithUser.CreatedAt
                        } : null
                    }).ToList() ?? new List<NoteShareResponseDTO>()
                }).ToList();

                return Ok(noteDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user notes for user {UserId}", userId);
                return StatusCode(500, "An error occurred while retrieving notes");
            }
        }

        // PATCH: api/notes/{noteId}/move
        [HttpPatch("{noteId}/move")]
        public async Task<IActionResult> MoveNote(int noteId, [FromBody] int newCategoryId)
        {
            var note = await _noteService.GetNoteByIdAsync(noteId);
            if (note == null) return NotFound();
            note.CategoryId = newCategoryId;
            note.UpdatedAt = DateTime.UtcNow;
            await _noteService.UpdateNoteAsync(note);
            return Ok(note);
        }

        [HttpPost("sync")]
        public async Task<ActionResult<SyncResponseDTO>> SyncNotes([FromBody] SyncRequestDTO request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var deviceId = request.DeviceId;

                // Sunucudaki notları al
                var serverNotes = await _noteService.GetUserNotesAsync(userId);

                // Çakışma kontrolü
                var conflicts = new List<Note>();
                foreach (var clientNote in request.Notes)
                {
                    var serverNote = serverNotes.FirstOrDefault(n => n.Id == clientNote.Id);
                    if (serverNote != null && serverNote.LastModifiedAt > clientNote.LastModifiedAt)
                    {
                        conflicts.Add(serverNote);
                    }
                }

                // Senkronizasyon yanıtı
                var response = new SyncResponseDTO
                {
                    ServerNotes = serverNotes.Select(n => _mapper.Map<NoteDTO>(n)).ToList(),
                    Conflicts = conflicts.Select(n => _mapper.Map<NoteDTO>(n)).ToList(),
                    SyncTimestamp = DateTime.UtcNow
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sync failed", error = ex.Message });
            }
        }

        [HttpPost("resolve-conflict")]
        public async Task<ActionResult> ResolveConflict([FromBody] ConflictResolutionDTO resolution)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                
                // Çakışma çözümü
                if (resolution.UseServerVersion)
                {
                    // Sunucu versiyonunu kullan
                    var serverNote = _mapper.Map<Note>(resolution.ServerNote);
                    await _noteService.UpdateNoteAsync(serverNote);
                }
                else
                {
                    // İstemci versiyonunu kullan
                    var clientNote = _mapper.Map<Note>(resolution.ClientNote);
                    await _noteService.UpdateNoteAsync(clientNote);
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Conflict resolution failed", error = ex.Message });
            }
        }
    }
} 