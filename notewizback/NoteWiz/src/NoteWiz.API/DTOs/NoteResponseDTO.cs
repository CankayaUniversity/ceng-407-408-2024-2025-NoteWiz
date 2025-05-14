using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace NoteWiz.API.DTOs
{
    public class NoteResponseDTO
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/[controller]")]
    public class NotesController : ControllerBase
    {
        private readonly ILogger<NotesController> _logger;

        public NotesController(ILogger<NotesController> logger)
        {
            _logger = logger;
        }

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            try
            {
                var note = GetNoteById(id);
                var dto = new NoteResponseDTO
                {
                    Id = note.Id,
                    Title = note.Title ?? string.Empty,
                    Content = note.Content ?? string.Empty,
                    // ... diğer alanlar ...
                };
                _logger.LogInformation("Returning NoteResponseDTO: {@dto}", dto);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "NoteResponseDTO mapping or serialization failed!");
                return StatusCode(500, "Mapping or serialization error");
            }
        }

        private Note GetNoteById(int id)
        {
            // This method should be implemented to retrieve a note by its ID
            throw new NotImplementedException();
        }
    }
} 