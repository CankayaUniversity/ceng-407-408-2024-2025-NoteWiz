using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteWiz.API.DTOs;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace NoteWiz.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NotesController : ControllerBase
    {
        private readonly INoteService _noteService;
        private readonly IFileService _fileService;

        public NotesController(INoteService noteService, IFileService fileService)
        {
            _noteService = noteService;
            _fileService = fileService;
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

        /// <summary>
        /// Upload an image to a note
        /// </summary>
        /// <param name="id">Note ID</param>
        /// <param name="dto">Image upload data</param>
        /// <returns>Uploaded image details</returns>
        /// <response code="200">Returns the uploaded image details</response>
        /// <response code="404">If the note is not found</response>
        [HttpPost("{id}/images")]
        [ProducesResponseType(typeof(NoteImageDTO), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<NoteImageDTO>> AddNoteImage(int id, [FromForm] CreateNoteImageDTO dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            
            // Upload the image file
            var imageUrl = await _fileService.UploadImageAsync(dto.Image);
            
            // Add image to note
            var noteImage = await _noteService.AddNoteImageAsync(id, userId, imageUrl, dto.Position);
            
            if (noteImage == null)
                return NotFound();

            return Ok(new NoteImageDTO
            {
                Id = noteImage.Id,
                ImageUrl = noteImage.ImageUrl,
                Position = noteImage.Position,
                UploadedAt = noteImage.UploadedAt
            });
        }

        /// <summary>
        /// Get all images of a note
        /// </summary>
        /// <param name="id">Note ID</param>
        /// <returns>List of note images</returns>
        /// <response code="200">Returns the list of images</response>
        /// <response code="404">If the note is not found</response>
        [HttpGet("{id}/images")]
        [ProducesResponseType(typeof(IEnumerable<NoteImageDTO>), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<IEnumerable<NoteImageDTO>>> GetNoteImages(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var images = await _noteService.GetNoteImagesAsync(id, userId);
            
            if (images == null)
                return NotFound();

            var imageDtos = images.Select(img => new NoteImageDTO
            {
                Id = img.Id,
                ImageUrl = img.ImageUrl,
                Position = img.Position,
                UploadedAt = img.UploadedAt
            });

            return Ok(imageDtos);
        }

        /// <summary>
        /// Delete an image from a note
        /// </summary>
        /// <param name="id">Note ID</param>
        /// <param name="imageId">Image ID</param>
        /// <returns>No content</returns>
        /// <response code="204">If the image was successfully deleted</response>
        /// <response code="404">If the note or image is not found</response>
        [HttpDelete("{id}/images/{imageId}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<ActionResult> DeleteNoteImage(int id, int imageId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _noteService.DeleteNoteImageAsync(id, imageId, userId);
            
            if (!result)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Add a drawing to a note
        /// </summary>
        /// <param name="id">Note ID</param>
        /// <param name="dto">Drawing data</param>
        /// <returns>Created drawing details</returns>
        /// <response code="200">Returns the created drawing details</response>
        /// <response code="404">If the note is not found</response>
        [HttpPost("{id}/drawings")]
        [ProducesResponseType(typeof(NoteDrawingDTO), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<NoteDrawingDTO>> AddNoteDrawing(int id, [FromBody] CreateNoteDrawingDTO dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var drawing = await _noteService.AddNoteDrawingAsync(id, userId, dto.DrawingData, dto.Position);
            
            if (drawing == null)
                return NotFound();

            return Ok(new NoteDrawingDTO
            {
                Id = drawing.Id,
                DrawingData = drawing.DrawingData,
                Position = drawing.Position,
                CreatedAt = drawing.CreatedAt
            });
        }

        /// <summary>
        /// Get all drawings of a note
        /// </summary>
        /// <param name="id">Note ID</param>
        /// <returns>List of drawings</returns>
        /// <response code="200">Returns the list of drawings</response>
        /// <response code="404">If the note is not found</response>
        [HttpGet("{id}/drawings")]
        [ProducesResponseType(typeof(IEnumerable<NoteDrawingDTO>), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<IEnumerable<NoteDrawingDTO>>> GetNoteDrawings(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var drawings = await _noteService.GetNoteDrawingsAsync(id, userId);
            
            if (drawings == null)
                return NotFound();

            var drawingDtos = drawings.Select(d => new NoteDrawingDTO
            {
                Id = d.Id,
                DrawingData = d.DrawingData,
                Position = d.Position,
                CreatedAt = d.CreatedAt
            });

            return Ok(drawingDtos);
        }

        /// <summary>
        /// Delete a drawing from a note
        /// </summary>
        /// <param name="id">Note ID</param>
        /// <param name="drawingId">Drawing ID</param>
        /// <returns>No content</returns>
        /// <response code="204">If the drawing was successfully deleted</response>
        /// <response code="404">If the note or drawing is not found</response>
        [HttpDelete("{id}/drawings/{drawingId}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<ActionResult> DeleteNoteDrawing(int id, int drawingId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _noteService.DeleteNoteDrawingAsync(id, drawingId, userId);
            
            if (!result)
                return NotFound();

            return NoContent();
        }
    }
} 