using Microsoft.AspNetCore.Mvc;
using NoteWiz.Infrastructure.Data;
using NoteWiz.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var categories = await _context.Categories
                    .Where(c => c.UserId == userId)
                    .Select(c => new {
                        Id = c.Id,
                        Name = c.Name,
                        UserId = c.UserId,
                        Color = c.Color,
                        CreatedAt = c.CreatedAt
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
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var notes = await _context.Notes
                .Where(n => n.CategoryId == categoryId && n.UserId == userId)
                .ToListAsync();
            return Ok(notes);
        }

        // POST: api/categories
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] Category category)
        {
            if (string.IsNullOrWhiteSpace(category.Name))
                return BadRequest("Name is required");

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            category.UserId = userId;
            category.CreatedAt = DateTime.UtcNow;
            
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return Ok(category);
        }

        // POST: api/categories/{categoryId}/notes
        [HttpPost("{categoryId}/notes")]
        public async Task<IActionResult> AddNoteToCategory(int categoryId, [FromBody] Note note)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            note.CategoryId = categoryId;
            note.UserId = userId;
            note.CreatedAt = DateTime.UtcNow;
            
            _context.Notes.Add(note);
            await _context.SaveChangesAsync();
            return Ok(note);
        }
    }
} 