using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using NoteWiz.Infrastructure.Data;

namespace NoteWiz.Infrastructure.Repositories
{
    public class UserDeviceRepository : GenericRepository<UserDevice>, IUserDeviceRepository
    {
        public UserDeviceRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<UserDevice>> GetUserDevicesAsync(int userId)
        {
            return await _context.UserDevices
                .Include(d => d.User)
                .Where(d => d.UserId == userId)
                .ToListAsync();
        }

        public async Task<UserDevice> GetDeviceByTokenAsync(string deviceToken)
        {
            return await _context.UserDevices
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.PushNotificationToken == deviceToken);
        }
    }
} 