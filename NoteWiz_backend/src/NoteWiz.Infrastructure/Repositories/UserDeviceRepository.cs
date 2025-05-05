using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using NoteWiz.Infrastructure.Data;

namespace NoteWiz.Infrastructure.Repositories
{
    public class UserDeviceRepository : IUserDeviceRepository
    {
        private readonly ApplicationDbContext _context;

        public UserDeviceRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UserDevice> GetByIdAsync(int id)
        {
            return await _context.UserDevices
                .Include(ud => ud.User)
                .FirstOrDefaultAsync(ud => ud.Id == id);
        }

        public async Task<UserDevice> GetByDeviceIdAsync(string deviceId)
        {
            return await _context.UserDevices
                .Include(ud => ud.User)
                .FirstOrDefaultAsync(ud => ud.DeviceId == deviceId);
        }

        public async Task<IEnumerable<UserDevice>> GetUserDevicesAsync(int userId)
        {
            return await _context.UserDevices
                .Include(ud => ud.User)
                .Where(ud => ud.UserId == userId)
                .ToListAsync();
        }

        public async Task<UserDevice> AddAsync(UserDevice userDevice)
        {
            userDevice.LastActiveAt = DateTime.UtcNow;
            await _context.UserDevices.AddAsync(userDevice);
            await _context.SaveChangesAsync();
            return userDevice;
        }

        public async Task<UserDevice> UpdateAsync(UserDevice userDevice)
        {
            _context.UserDevices.Update(userDevice);
            await _context.SaveChangesAsync();
            return userDevice;
        }

        public async Task DeleteAsync(UserDevice userDevice)
        {
            _context.UserDevices.Remove(userDevice);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> UpdateLastActiveAsync(int id)
        {
            var userDevice = await GetByIdAsync(id);
            if (userDevice == null)
                return false;

            userDevice.LastActiveAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
    }
} 