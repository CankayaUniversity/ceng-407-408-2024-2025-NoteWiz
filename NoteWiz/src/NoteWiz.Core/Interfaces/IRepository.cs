using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace NoteWiz.Core.Interfaces
{
    /// <summary>
    /// Generic repository interface for CRUD operations
    /// </summary>
    /// <typeparam name="T">Entity type</typeparam>
    public interface IRepository<T> where T : class, IEntity
    {
        // Create
        Task<T> AddAsync(T entity);

        // Read
        Task<T> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);

        // Update
        Task<T> UpdateAsync(T entity);

        // Delete
        Task DeleteAsync(int id);
        Task DeleteAsync(T entity);

        // Additional helpers
        Task<bool> ExistsAsync(int id);
        Task<int> CountAsync(Expression<Func<T, bool>> predicate = null);
    }
} 