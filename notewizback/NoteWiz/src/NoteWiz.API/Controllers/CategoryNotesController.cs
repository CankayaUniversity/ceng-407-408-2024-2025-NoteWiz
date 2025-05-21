using Microsoft.AspNetCore.Mvc;
using NoteWiz.Infrastructure.Data;
using NoteWiz.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace NoteWiz.API.Controllers
{
    [ApiController]
    [Route("api/categories")]
    [Authorize]
    public class CategoryNotesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public CategoryNotesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/categories
        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            try 
            {
                var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
                var categories = await _context.Categories
                    .Where(c => c.UserId == userId)
                    .Select(c => new {
                        Id = c.Id,
                        Name = c.Name,
                        UserId = c.UserId
                    })
                    .ToListAsync();
                
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
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

        // DTO tanımı
        public class CreateCategoryDto
        {
            public string Name { get; set; }
        }

        // POST: api/categories
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Name is required");

            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            var category = new Category
            {
                Name = dto.Name,
                UserId = userId,
            };
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return Ok(category);
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
    }
} 