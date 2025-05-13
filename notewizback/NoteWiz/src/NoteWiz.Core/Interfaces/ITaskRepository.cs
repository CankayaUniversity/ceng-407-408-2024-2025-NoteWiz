using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    public interface ITaskRepository : IGenericRepository<TaskItem>
    {
        Task<IEnumerable<TaskItem>> GetUserTasksAsync(int userId);
    }
} 