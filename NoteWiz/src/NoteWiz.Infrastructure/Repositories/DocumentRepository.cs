using Microsoft.EntityFrameworkCore;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using NoteWiz.Infrastructure.Data;

namespace NoteWiz.Infrastructure.Repositories
{
    public class DocumentRepository : Repository<Document>, IDocumentRepository
    {
        private readonly NoteWizDbContext _context;

        public DocumentRepository(NoteWizDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Document>> GetUserDocumentsAsync(int userId)
        {
            return await _context.Documents
                .Where(d => d.UserId == userId)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();
        }

        public async Task<Document> GetDocumentWithNotesAsync(int documentId)
        {
            return await _context.Documents
                .Include(d => d.Notes)
                .FirstOrDefaultAsync(d => d.Id == documentId);
        }
    }
} 