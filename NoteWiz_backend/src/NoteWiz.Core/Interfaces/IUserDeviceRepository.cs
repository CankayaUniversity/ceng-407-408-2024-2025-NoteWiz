using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    public interface IUserDeviceRepository
    {
        Task<UserDevice> GetByIdAsync(int id);
        Task<UserDevice> GetByDeviceIdAsync(string deviceId);
        Task<IEnumerable<UserDevice>> GetUserDevicesAsync(int userId);
        Task<UserDevice> AddAsync(UserDevice userDevice);
        Task<UserDevice> UpdateAsync(UserDevice userDevice);
        Task DeleteAsync(UserDevice userDevice);
        Task<bool> UpdateLastActiveAsync(int id);
    }
} 