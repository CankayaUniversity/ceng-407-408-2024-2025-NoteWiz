using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using NoteWiz.Infrastructure.Data;

namespace NoteWiz.Infrastructure.Repositories
{
    public class NoteRepository : GenericRepository<Note>, INoteRepository
    {
        public NoteRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Note>> GetUserNotesAsync(int userId)
        {
            return await _context.Notes
                .Include(n => n.User)
                .Include(n => n.SharedWith)
                    .ThenInclude(sw => sw.SharedWithUser)
                .Include(n => n.Document)
                .Where(n => n.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Note>> GetSharedNotesAsync(int userId)
        {
            return await _context.Notes
                .Include(n => n.User)
                .Include(n => n.SharedWith)
                    .ThenInclude(sw => sw.SharedWithUser)
                .Include(n => n.Document)
                .Where(n => n.SharedWith.Any(s => s.SharedWithUserId == userId))
                .ToListAsync();
        }

        public async Task<Note> AddAsync(Note note)
        {
            await _context.Notes.AddAsync(note);
            await _context.SaveChangesAsync();
            return note;
        }

        public async Task<Note> UpdateAsync(Note note)
        {
            _context.Notes.Update(note);
            await _context.SaveChangesAsync();
            return note;
        }

        public async Task DeleteAsync(Note note)
        {
            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> AddNoteShareAsync(NoteShare noteShare)
        {
            await _context.NoteShares.AddAsync(noteShare);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<NoteShare> GetNoteShareAsync(int noteId, int userId)
        {
            return await _context.NoteShares
                .FirstOrDefaultAsync(ns => ns.NoteId == noteId && ns.SharedWithUserId == userId);
        }

        public async Task<IEnumerable<NoteShare>> GetNoteSharesByNoteIdAndUserIdAsync(int noteId, int userId)
        {
            return await _context.NoteShares
                .Where(ns => ns.NoteId == noteId && ns.SharedWithUserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<NoteShare>> GetNoteSharesByNoteIdAsync(int noteId)
        {
            return await _context.NoteShares
                .Where(ns => ns.NoteId == noteId)
                .ToListAsync();
        }

        public override async Task<Note> GetByIdAsync(int id)
        {
            return await _context.Notes
                .Include(n => n.User)
                .Include(n => n.SharedWith)
                    .ThenInclude(sw => sw.SharedWithUser)
                .Include(n => n.Document)
                .FirstOrDefaultAsync(n => n.Id == id);
        }
    }
} 