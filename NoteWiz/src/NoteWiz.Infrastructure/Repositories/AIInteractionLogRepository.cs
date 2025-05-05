using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using NoteWiz.Infrastructure.Data;

namespace NoteWiz.Infrastructure.Repositories
{
    public class AIInteractionLogRepository : IRepository<AIInteractionLog>
    {
        private readonly NoteWizDbContext _context;
        private readonly DbSet<AIInteractionLog> _dbSet;

        public AIInteractionLogRepository(NoteWizDbContext context)
        {
            _context = context;
            _dbSet = context.Set<AIInteractionLog>();
        }

        public async Task<AIInteractionLog> AddAsync(AIInteractionLog entity)
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<AIInteractionLog> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task<IEnumerable<AIInteractionLog>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public async Task<IEnumerable<AIInteractionLog>> FindAsync(System.Linq.Expressions.Expression<System.Func<AIInteractionLog, bool>> predicate)
        {
            return await _dbSet.Where(predicate).ToListAsync();
        }

        public async Task<AIInteractionLog> UpdateAsync(AIInteractionLog entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                await DeleteAsync(entity);
            }
        }

        public async Task DeleteAsync(AIInteractionLog entity)
        {
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _dbSet.AnyAsync(e => e.Id == id);
        }

        public async Task<int> CountAsync(System.Linq.Expressions.Expression<System.Func<AIInteractionLog, bool>> predicate = null)
        {
            if (predicate == null)
            {
                return await _dbSet.CountAsync();
            }
            return await _dbSet.CountAsync(predicate);
        }

        public async Task<IEnumerable<AIInteractionLog>> GetUserInteractionsAsync(int userId)
        {
            return await _dbSet
                .Where(log => log.UserId == userId)
                .OrderByDescending(log => log.CreatedAt)
                .ToListAsync();
        }
    }
} 