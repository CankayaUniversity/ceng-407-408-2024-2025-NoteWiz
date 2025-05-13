using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteWiz.API.DTOs;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using System.Security.Claims;

namespace NoteWiz.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NoteSharesController : ControllerBase
    {
        private readonly IRepository<NoteShare> _noteShareRepository;
        private readonly IRepository<Note> _noteRepository;
        private readonly IRepository<User> _userRepository;
        private readonly INoteService _noteService;

        public NoteSharesController(
            IRepository<NoteShare> noteShareRepository,
            IRepository<Note> noteRepository,
            IRepository<User> userRepository,
            INoteService noteService)
        {
            _noteShareRepository = noteShareRepository;
            _noteRepository = noteRepository;
            _userRepository = userRepository;
            _noteService = noteService;
        }

        [HttpGet("my-notes/{noteId}")]
        public async Task<IActionResult> GetSharesForMyNote(int noteId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            int userId = int.Parse(userIdClaim.Value);
            
            // Verify the note exists and belongs to current user
            var note = await _noteRepository.GetByIdAsync(noteId);
            if (note == null || note.UserId != userId)
            {
                return Forbid();
            }

            var shares = await _noteShareRepository.FindAsync(ns => ns.NoteId == noteId);
            var result = new List<NoteShareResponseDTO>();

            foreach (var share in shares)
            {
                var sharedWithUser = await _userRepository.GetByIdAsync(share.SharedWithUserId);
                if (sharedWithUser != null)
                {
                    result.Add(new NoteShareResponseDTO
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

            return Ok(result);
        }

        [HttpGet("note/{noteId}")]
        public async Task<IActionResult> GetSharesForNote(int noteId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            int userId = int.Parse(userIdClaim.Value);
            
            // Verify the note exists and user has access to it
            var note = await _noteRepository.GetByIdAsync(noteId);
            if (note == null)
            {
                return NotFound();
            }

            bool isOwner = note.UserId == userId;
            if (!isOwner)
            {
                // Check if user has access to this note
                var shares = await _noteShareRepository.FindAsync(
                    ns => ns.NoteId == noteId && ns.SharedWithUserId == userId);
                
                if (!shares.Any())
                {
                    return Forbid();
                }
            }

            var allShares = await _noteShareRepository.FindAsync(ns => ns.NoteId == noteId);
            var result = new List<NoteShareResponseDTO>();

            foreach (var share in allShares)
            {
                var sharedWithUser = await _userRepository.GetByIdAsync(share.SharedWithUserId);
                if (sharedWithUser != null)
                {
                    result.Add(new NoteShareResponseDTO
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

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateNoteShareDTO request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            int userId = int.Parse(userIdClaim.Value);
            
            // Verify the note exists and belongs to the current user
            var note = await _noteRepository.GetByIdAsync(request.NoteId);
            if (note == null || note.UserId != userId)
            {
                return Forbid();
            }

            // Verify the user to share with exists
            var userToShareWith = await _userRepository.GetByIdAsync(request.SharedWithUserId);
            if (userToShareWith == null)
            {
                return BadRequest("User to share with does not exist");
            }

            // Check if the share already exists
            var existingShares = await _noteShareRepository.FindAsync(
                ns => ns.NoteId == request.NoteId && ns.SharedWithUserId == request.SharedWithUserId);
            
            if (existingShares.Any())
            {
                return BadRequest("Note is already shared with this user");
            }

            var noteShare = new NoteShare
            {
                NoteId = request.NoteId,
                SharedWithUserId = request.SharedWithUserId,
                CanEdit = request.CanEdit,
                SharedAt = DateTime.UtcNow
            };

            var createdShare = await _noteShareRepository.AddAsync(noteShare);
            
            return CreatedAtAction(nameof(GetSharesForMyNote), 
                new { noteId = createdShare.NoteId }, 
                new NoteShareResponseDTO
                {
                    Id = createdShare.Id,
                    NoteId = createdShare.NoteId,
                    SharedWithUserId = createdShare.SharedWithUserId,
                    SharedWithUserEmail = userToShareWith.Email,
                    CanEdit = createdShare.CanEdit,
                    SharedAt = createdShare.SharedAt,
                    SharedWithUser = new UserResponseDTO
                    {
                        Id = userToShareWith.Id,
                        Username = userToShareWith.Username,
                        Email = userToShareWith.Email,
                        FullName = userToShareWith.FullName,
                        CreatedAt = userToShareWith.CreatedAt
                    }
                });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            int userId = int.Parse(userIdClaim.Value);
            
            var noteShare = await _noteShareRepository.GetByIdAsync(id);
            if (noteShare == null)
            {
                return NotFound();
            }

            // Verify the share is for a note owned by the current user
            var note = await _noteRepository.GetByIdAsync(noteShare.NoteId);
            if (note == null || note.UserId != userId)
            {
                return Forbid();
            }

            await _noteShareRepository.DeleteAsync(id);
            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateNoteShareDTO request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            int userId = int.Parse(userIdClaim.Value);
            
            var noteShare = await _noteShareRepository.GetByIdAsync(id);
            if (noteShare == null)
            {
                return NotFound();
            }

            // Verify the share is for a note owned by the current user
            var note = await _noteRepository.GetByIdAsync(noteShare.NoteId);
            if (note == null || note.UserId != userId)
            {
                return Forbid();
            }

            noteShare.CanEdit = request.CanEdit;
            await _noteShareRepository.UpdateAsync(noteShare);
            
            var userSharedWith = await _userRepository.GetByIdAsync(noteShare.SharedWithUserId);
            if (userSharedWith == null)
            {
                return NotFound("Shared user not found");
            }
            
            return Ok(new NoteShareResponseDTO
            {
                Id = noteShare.Id,
                NoteId = noteShare.NoteId,
                SharedWithUserId = noteShare.SharedWithUserId,
                SharedWithUserEmail = userSharedWith.Email,
                CanEdit = noteShare.CanEdit,
                SharedAt = noteShare.SharedAt,
                SharedWithUser = new UserResponseDTO
                {
                    Id = userSharedWith.Id,
                    Username = userSharedWith.Username,
                    Email = userSharedWith.Email,
                    FullName = userSharedWith.FullName,
                    CreatedAt = userSharedWith.CreatedAt
                }
            });
        }

        [HttpGet("users/{email}")]
        public async Task<IActionResult> GetUserByEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest("Email cannot be empty");
            }

            var users = await _userRepository.FindAsync(u => u.Email == email);
            var user = users.FirstOrDefault();
            
            if (user == null)
            {
                return NotFound();
            }

            return Ok(new UserBriefDTO
            {
                Id = user.Id,
                Email = user.Email,
                Username = user.Username
            });
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                throw new UnauthorizedAccessException();
            }
            return int.Parse(userIdClaim.Value);
        }
    }
} 