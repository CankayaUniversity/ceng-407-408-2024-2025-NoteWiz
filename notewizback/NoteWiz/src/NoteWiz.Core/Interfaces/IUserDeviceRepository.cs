using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    public interface IUserDeviceRepository : IGenericRepository<UserDevice>
    {
        Task<IEnumerable<UserDevice>> GetUserDevicesAsync(int userId);
        Task<UserDevice> GetDeviceByTokenAsync(string deviceToken);
    }
} 