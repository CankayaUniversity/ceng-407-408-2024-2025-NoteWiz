using Microsoft.AspNetCore.Mvc;
using NoteWiz.Infrastructure.Data;
using NoteWiz.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace NoteWiz.API.Controllers
{
    [ApiController]
    [Route("api/categories")]
    public class CategoryNotesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public CategoryNotesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/categories/{categoryId}/notes
        [HttpGet("{categoryId}/notes")]
        public async Task<IActionResult> GetNotesByCategory(int categoryId)
        {
            var notes = await _context.Notes
                .Where(n => n.CategoryId == categoryId)
                .ToListAsync();
            return Ok(notes);
        }

        // POST: api/categories/{categoryId}/notes
        [HttpPost("{categoryId}/notes")]
        public async Task<IActionResult> AddNoteToCategory(int categoryId, [FromBody] Note note)
        {
            note.CategoryId = categoryId;
            note.CreatedAt = DateTime.UtcNow;
            _context.Notes.Add(note);
            await _context.SaveChangesAsync();
            return Ok(note);
        }

        // POST: api/categories
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] Category category)
        {
            if (string.IsNullOrWhiteSpace(category.Name))
                return BadRequest("Name is required");

            // Kullanıcı ID'sini token'dan al
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            category.UserId = int.Parse(userIdClaim.Value);
            category.CreatedAt = DateTime.UtcNow;
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return Ok(category);
        }

        // GET: api/categories
        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories.ToListAsync();
            return Ok(categories);
        }
    }
} 