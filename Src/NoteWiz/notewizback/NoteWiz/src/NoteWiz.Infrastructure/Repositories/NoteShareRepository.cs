using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using NoteWiz.Infrastructure.Data;

namespace NoteWiz.Infrastructure.Repositories
{
    public class NoteShareRepository : GenericRepository<NoteShare>, INoteShareRepository
    {
        public NoteShareRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<NoteShare>> GetNoteSharesByNoteIdAsync(int noteId)
        {
            return await _context.NoteShares
                .Include(ns => ns.SharedWithUser)
                .Where(ns => ns.NoteId == noteId)
                .ToListAsync();
        }

        public async Task<IEnumerable<NoteShare>> GetNoteSharesByNoteIdAndUserIdAsync(int noteId, int userId)
        {
            return await _context.NoteShares
                .Include(ns => ns.SharedWithUser)
                .Where(ns => ns.NoteId == noteId && ns.SharedWithUserId == userId)
                .ToListAsync();
        }

        public IQueryable<NoteShare> Query()
        {
            return _context.NoteShares;
        }

        public async Task DeleteAsync(NoteShare noteShare)
        {
            _context.NoteShares.Remove(noteShare);
            await _context.SaveChangesAsync();
        }
    }
} 