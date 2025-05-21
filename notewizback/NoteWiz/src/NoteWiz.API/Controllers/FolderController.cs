using Microsoft.AspNetCore.Mvc;
using NoteWiz.Core.Entities;
using NoteWiz.Infrastructure.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace NoteWiz.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FolderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public FolderController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/folder
        [HttpGet]
        public IActionResult GetFolders()
        {
            var folders = _context.Folders.ToList();
            return Ok(folders);
        }

        // GET: api/folder/{id}/notes
        [HttpGet("{id}/notes")]
        public async Task<IActionResult> GetFolderNotes(int id)
        {
            var notes = await _context.FolderNotes
                .Where(fn => fn.FolderId == id)
                .Select(fn => fn.Note)
                .ToListAsync();
            return Ok(notes);
        }

        // GET: api/note/{id}/folders
        [HttpGet("~/api/note/{id}/folders")]
        public async Task<IActionResult> GetNoteFolders(int id)
        {
            var folders = await _context.FolderNotes
                .Where(fn => fn.NoteId == id)
                .Select(fn => fn.Folder)
                .ToListAsync();
            return Ok(folders);
        }

        // GET: api/folder/{id}/not-available
        [HttpGet("{id}/not-available")]
        public async Task<IActionResult> GetNotesNotInFolder(int id)
        {
            var notes = await _context.Notes
                .Where(n => !_context.FolderNotes.Any(fn => fn.FolderId == id && fn.NoteId == n.Id))
                .ToListAsync();
            return Ok(notes);
        }

        // POST: api/folder
        [HttpPost]
        public async Task<IActionResult> CreateFolder([FromBody] Folder folder)
        {
            if (string.IsNullOrWhiteSpace(folder.Name))
                return BadRequest("Folder name is required");
            if (string.IsNullOrWhiteSpace(folder.Color))
                folder.Color = "#FFFFFF";
            _context.Folders.Add(folder);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetFolders), new { id = folder.Id }, folder);
        }

        // DELETE: api/folder/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFolder(int id)
        {
            var folder = await _context.Folders.FindAsync(id);
            if (folder == null)
                return NotFound();
            _context.Folders.Remove(folder);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/folder/{folderId}/notes/{noteId}
        [HttpPost("{folderId}/notes/{noteId}")]
        public async Task<IActionResult> AddNoteToFolder(int folderId, int noteId)
        {
            var exists = await _context.FolderNotes.AnyAsync(fn => fn.FolderId == folderId && fn.NoteId == noteId);
            if (!exists)
            {
                _context.FolderNotes.Add(new FolderNote { FolderId = folderId, NoteId = noteId });
                await _context.SaveChangesAsync();
            }
            // İlgili klasördeki notları döndür
            var notes = await _context.FolderNotes
                .Where(fn => fn.FolderId == folderId)
                .Select(fn => fn.Note)
                .ToListAsync();
            return Ok(notes);
        }

        // DELETE: api/folder/{folderId}/notes/{noteId}
        [HttpDelete("{folderId}/notes/{noteId}")]
        public async Task<IActionResult> RemoveNoteFromFolder(int folderId, int noteId)
        {
            var folderNote = await _context.FolderNotes
                .FirstOrDefaultAsync(fn => fn.FolderId == folderId && fn.NoteId == noteId);

            if (folderNote == null)
                return NotFound();

            _context.FolderNotes.Remove(folderNote);
            await _context.SaveChangesAsync();

            // İlgili klasördeki güncel notları döndür (isteğe bağlı)
            var notes = await _context.FolderNotes
                .Where(fn => fn.FolderId == folderId)
                .Select(fn => fn.Note)
                .ToListAsync();
            return Ok(notes);
        }
    }
} 