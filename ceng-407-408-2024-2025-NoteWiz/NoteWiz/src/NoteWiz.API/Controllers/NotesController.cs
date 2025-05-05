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
    /// <summary>
    /// Controller for managing notes
    /// </summary>
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

        /// <summary>
        /// Get all notes for the authenticated user
        /// </summary>
        /// <returns>List of notes</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NoteResponseDTO>>> GetUserNotes()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var notes = await _noteService.GetUserNotesAsync(userId);
            var noteDtos = notes.Select(MapToNoteResponseDto);
            return Ok(noteDtos);
        }

        /// <summary>
        /// Get a specific note by ID
        /// </summary>
        /// <param name="id">Note ID</param>
        /// <returns>Note details</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<NoteResponseDTO>> GetNote(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var note = await _noteService.GetNoteByIdAsync(id, userId);
            
            if (note == null)
                return NotFound();

            return Ok(MapToNoteResponseDto(note));
        }

        /// <summary>
        /// Create a new note
        /// </summary>
        /// <param name="createNoteDto">Note creation data</param>
        /// <returns>Created note details</returns>
        [HttpPost]
        public async Task<ActionResult<NoteResponseDTO>> CreateNote(CreateNoteDTO createNoteDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            
            var note = new Note
            {
                Title = createNoteDto.Title,
                Content = createNoteDto.Content,
                Tags = createNoteDto.Tags,
                Color = createNoteDto.Color,
                IsPinned = createNoteDto.IsPinned,
                CoverType = createNoteDto.CoverType,
                CoverColor = createNoteDto.CoverColor,
                CoverImageUrl = createNoteDto.CoverImageUrl,
                CoverPosition = createNoteDto.CoverPosition,
                IsArchived = createNoteDto.IsArchived,
                UserId = userId
            };

            var createdNote = await _noteService.CreateNoteAsync(note);
            return CreatedAtAction(nameof(GetNote), new { id = createdNote.Id }, MapToNoteResponseDto(createdNote));
        }

        /// <summary>
        /// Update an existing note
        /// </summary>
        /// <param name="id">Note ID</param>
        /// <param name="updateNoteDto">Note update data</param>
        /// <returns>Updated note details</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<NoteResponseDTO>> UpdateNote(int id, UpdateNoteDTO updateNoteDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var existingNote = await _noteService.GetNoteByIdAsync(id, userId);
            
            if (existingNote == null)
                return NotFound();

            existingNote.Title = updateNoteDto.Title;
            existingNote.Content = updateNoteDto.Content;
            existingNote.Tags = updateNoteDto.Tags;
            existingNote.Color = updateNoteDto.Color;
            existingNote.IsPinned = updateNoteDto.IsPinned;
            existingNote.CoverType = updateNoteDto.CoverType;
            existingNote.CoverColor = updateNoteDto.CoverColor;
            existingNote.CoverImageUrl = updateNoteDto.CoverImageUrl;
            existingNote.CoverPosition = updateNoteDto.CoverPosition;
            existingNote.IsArchived = updateNoteDto.IsArchived;

            var updatedNote = await _noteService.UpdateNoteAsync(existingNote);
            return Ok(MapToNoteResponseDto(updatedNote));
        }

        /// <summary>
        /// Update the cover of a note
        /// </summary>
        /// <param name="id">Note ID</param>
        /// <param name="updateCoverDto">Cover update data</param>
        /// <returns>Updated note details</returns>
        /// <response code="200">Returns the updated note</response>
        /// <response code="404">If the note is not found</response>
        [HttpPut("{id}/cover")]
        [ProducesResponseType(typeof(NoteResponseDTO), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<NoteResponseDTO>> UpdateNoteCover(int id, UpdateCoverDTO updateCoverDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var updatedNote = await _noteService.UpdateNoteCoverAsync(
                id,
                userId,
                updateCoverDto.CoverType,
                updateCoverDto.CoverColor,
                updateCoverDto.CoverImageUrl,
                updateCoverDto.CoverPosition
            );

            if (updatedNote == null)
                return NotFound();

            return Ok(MapToNoteResponseDto(updatedNote));
        }

        /// <summary>
        /// Remove the cover from a note
        /// </summary>
        /// <param name="id">Note ID</param>
        /// <returns>No content</returns>
        /// <response code="204">If the cover was successfully removed</response>
        /// <response code="404">If the note is not found</response>
        [HttpDelete("{id}/cover")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<ActionResult> RemoveNoteCover(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _noteService.RemoveNoteCoverAsync(id, userId);

            if (!result)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Get all notes with a specific cover type
        /// </summary>
        /// <param name="type">Cover type to filter by</param>
        /// <returns>List of notes with the specified cover type</returns>
        /// <response code="200">Returns the list of notes</response>
        [HttpGet("covers/{type}")]
        [ProducesResponseType(typeof(IEnumerable<NoteResponseDTO>), 200)]
        public async Task<ActionResult<IEnumerable<NoteResponseDTO>>> GetNotesByCoverType(CoverType type)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var notes = await _noteService.GetNotesByCoverTypeAsync(userId, type);
            var noteDtos = notes.Select(MapToNoteResponseDto);
            return Ok(noteDtos);
        }

        /// <summary>
        /// Delete a note
        /// </summary>
        /// <param name="id">Note ID</param>
        /// <returns>No content</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteNote(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _noteService.DeleteNoteAsync(id, userId);
            
            if (!result)
                return NotFound();

            return NoContent();
        }

        private static NoteResponseDTO MapToNoteResponseDto(Note note)
        {
            return new NoteResponseDTO
            {
                Id = note.Id,
                Title = note.Title,
                Content = note.Content,
                Tags = note.Tags,
                Color = note.Color,
                IsPinned = note.IsPinned,
                CoverType = note.CoverType,
                CoverColor = note.CoverColor,
                CoverImageUrl = note.CoverImageUrl,
                CoverPosition = note.CoverPosition,
                IsArchived = note.IsArchived,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt
            };
        }
    }
} 