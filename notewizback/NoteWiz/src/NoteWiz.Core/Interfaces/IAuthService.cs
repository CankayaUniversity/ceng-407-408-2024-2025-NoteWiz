using System.Threading.Tasks;
using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    /// <summary>
    /// Service for authentication-related operations
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Generates a password hash from a plain text password
        /// </summary>
        string HashPassword(string password);

        /// <summary>
        /// Verifies if a plain text password matches a hashed password
        /// </summary>
        bool VerifyPassword(string password, string passwordHash);

        /// <summary>
        /// Generates a JWT token for a user
        /// </summary>
        string GenerateJwtToken(User user);

        Task<(bool success, string token)> LoginAsync(string email, string password);
        Task<(bool success, string message)> RegisterAsync(User user, string password);
        Task<bool> ValidateTokenAsync(string token);
        Task<bool> RevokeTokenAsync(string token);
        Task<string> RefreshTokenAsync(string refreshToken);
    }
} 