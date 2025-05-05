// NoteWiz.API/Controllers/CategoryController.cs
using Microsoft.AspNetCore.Mvc;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using System;
using System.Threading.Tasks;

namespace NoteWiz.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoriesController(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        // GET: api/categories?userId=1
        [HttpGet]
        public async Task<IActionResult> GetCategories([FromQuery] int userId)
        {
            var categories = await _categoryRepository.GetByUserIdAsync(userId);
            return Ok(categories);
        }

        // GET: api/categories/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null) return NotFound();
            return Ok(category);
        }

        // POST: api/categories
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] Category category)
        {
            category.CreatedAt = DateTime.UtcNow;
            category.UpdatedAt = DateTime.UtcNow;
            var created = await _categoryRepository.AddAsync(category);
            return CreatedAtAction(nameof(GetCategory), new { id = created.Id }, created);
        }

        // PUT: api/categories/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category category)
        {
            if (id != category.Id) return BadRequest();
            category.UpdatedAt = DateTime.UtcNow;
            var updated = await _categoryRepository.UpdateAsync(category);
            return Ok(updated);
        }

        // DELETE: api/categories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            await _categoryRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}