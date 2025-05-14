using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace NoteWiz.Infrastructure.Services
{
    /// <summary>
    /// Implementation of IAuthService for authentication operations
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly IUserRepository _userRepository;

        public AuthService(IConfiguration configuration, IUserRepository userRepository)
        {
            _configuration = configuration;
            _userRepository = userRepository;
        }

        /// <summary>
        /// Generates a password hash using BCrypt algorithm
        /// </summary>
        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        /// <summary>
        /// Verifies if a plain text password matches a hashed password
        /// </summary>
        public bool VerifyPassword(string password, string passwordHash)
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }

        /// <summary>
        /// Generates a JWT token for a user
        /// </summary>
        public string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["AppSettings:JWT:SecretKey"] ?? "DefaultDevKeyForTesting12345678901234567890");
            var durationInMinutes = int.Parse(_configuration["AppSettings:JWT:ExpiryInMinutes"] ?? "60");
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Name, user.Username)
                }),
                NotBefore = DateTime.UtcNow,
                IssuedAt = DateTime.UtcNow,
                Expires = DateTime.UtcNow.AddMinutes(durationInMinutes),
                Issuer = _configuration["AppSettings:JWT:Issuer"],
                Audience = _configuration["AppSettings:JWT:Audience"],
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };
            
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<(bool success, string token)> LoginAsync(string email, string password)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null || !VerifyPassword(password, user.PasswordHash))
                return (false, string.Empty);

            var token = GenerateJwtToken(user);
            return (true, token);
        }

        public async Task<(bool success, string message)> RegisterAsync(User user, string password)
        {
            if (await _userRepository.ExistsAsync(user.Email))
                return (false, "User already exists");

            user.PasswordHash = HashPassword(password);
            user.CreatedAt = DateTime.UtcNow;

            await _userRepository.AddAsync(user);
            return (true, "Registration successful");
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["AppSettings:JWT:SecretKey"] ?? "DefaultDevKeyForTesting12345678901234567890");
            
            try
            {
                await Task.Run(() =>
                {
                    tokenHandler.ValidateToken(token, new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ValidateIssuer = true,
                        ValidIssuer = _configuration["AppSettings:JWT:Issuer"],
                        ValidateAudience = true,
                        ValidAudience = _configuration["AppSettings:JWT:Audience"],
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.FromMinutes(1),
                        RequireExpirationTime = true,
                        RequireSignedTokens = true
                    }, out SecurityToken validatedToken);
                });

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Token validation failed: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> RevokeTokenAsync(string token)
        {
            // Implement token revocation logic if needed
            return await Task.FromResult(true);
        }

        public async Task<string> RefreshTokenAsync(string refreshToken)
        {
            // Implement refresh token logic if needed
            return await Task.FromResult(string.Empty);
        }
    }
} 