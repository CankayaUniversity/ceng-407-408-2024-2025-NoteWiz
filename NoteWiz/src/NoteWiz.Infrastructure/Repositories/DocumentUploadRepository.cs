using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using NoteWiz.Infrastructure.Data;

namespace NoteWiz.Infrastructure.Repositories
{
    public class DocumentUploadRepository : GenericRepository<DocumentUpload>, IDocumentUploadRepository
    {
        public DocumentUploadRepository(NoteWizDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<DocumentUpload>> GetUserDocumentsAsync(int userId)
        {
            return await _context.DocumentUploads
                .Include(d => d.User)
                .Where(d => d.UserId == userId)
                .ToListAsync();
        }
    }
} 