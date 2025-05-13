using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Application.Services
{
    public class TaskService : ITaskService
    {
        private readonly IUnitOfWork _unitOfWork;

        public TaskService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<TaskItem> GetTaskByIdAsync(int id)
        {
            return await _unitOfWork.Tasks.GetByIdAsync(id);
        }

        public async Task<IEnumerable<TaskItem>> GetUserTasksAsync(int userId)
        {
            return await _unitOfWork.Tasks.GetUserTasksAsync(userId);
        }

        public async Task<TaskItem> CreateTaskAsync(TaskItem task)
        {
            await _unitOfWork.Tasks.AddAsync(task);
            await _unitOfWork.SaveChangesAsync();
            return task;
        }

        public async Task<TaskItem> UpdateTaskAsync(TaskItem task)
        {
            _unitOfWork.Tasks.Update(task);
            await _unitOfWork.SaveChangesAsync();
            return task;
        }

        public async Task DeleteTaskAsync(int id)
        {
            var task = await _unitOfWork.Tasks.GetByIdAsync(id);
            if (task != null)
            {
                _unitOfWork.Tasks.Remove(task);
                await _unitOfWork.SaveChangesAsync();
            }
        }
    }
} 