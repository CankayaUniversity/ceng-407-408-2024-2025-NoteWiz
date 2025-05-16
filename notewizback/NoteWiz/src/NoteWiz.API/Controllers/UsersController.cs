using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteWiz.API.DTOs;
using NoteWiz.Core.DTOs;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using NoteWiz.Infrastructure.Data;
using NoteWiz.Infrastructure.Services;

namespace NoteWiz.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserRepository _userRepository;
        private readonly NoteWizDbContext _context;
        private readonly IEmailService _emailService;

        public UsersController(IAuthService authService, IUserRepository userRepository, NoteWizDbContext context, IEmailService emailService)
        {
            _authService = authService;
            _userRepository = userRepository;
            _context = context;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserResponseDTO>> Register([FromBody] RegisterDTO dto)
        {
            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                FullName = dto.FullName,
                CreatedAt = DateTime.UtcNow
            };

            var (success, message) = await _authService.RegisterAsync(user, dto.Password);
            if (!success)
                return BadRequest(message);

            var responseDto = new UserResponseDTO
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                CreatedAt = user.CreatedAt
            };

            return Ok(responseDto);
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDTO>> Login([FromBody] LoginDTO dto)
        {
            try
            {
                var (success, token) = await _authService.LoginAsync(dto.Email, dto.Password);
                if (!success)
                    return Unauthorized(new { message = "Invalid email or password" });

                var user = await _userRepository.GetByEmailAsync(dto.Email);
                if (user == null)
                    return Unauthorized(new { message = "User not found" });

                var response = new LoginResponseDTO
                {
                    Token = token,
                    User = new UserResponseDTO
                    {
                        Id = user.Id,
                        Username = user.Username,
                        Email = user.Email,
                        FullName = user.FullName,
                        CreatedAt = user.CreatedAt
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during login", error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDTO>> GetUserById(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            var currentUserId = int.Parse(userIdClaim.Value);
            
            if (id != currentUserId && !User.IsInRole("Admin"))
                return Forbid();

            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                return NotFound();

            var responseDto = new UserResponseDTO
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                CreatedAt = user.CreatedAt
            };

            return Ok(responseDto);
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<UserResponseDTO>> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                return Unauthorized();
            }
            var userId = int.Parse(userIdClaim.Value);
            
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return NotFound();

            var responseDto = new UserResponseDTO
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                CreatedAt = user.CreatedAt
            };

            return Ok(responseDto);
        }

        // GET: api/users/search?username=ali
        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers(string username)
        {
            var users = await _context.Users
                .Where(u => u.Username.Contains(username))
                .Select(u => new { u.Id, u.Username, u.Email })
                .ToListAsync();
            return Ok(users);
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest model)
        {
            if (string.IsNullOrEmpty(model.Email))
                return BadRequest("Email is required");

            var user = await _userRepository.GetByEmailAsync(model.Email);
            if (user == null)
                return BadRequest("Email not found");

            // Token üretimi (örnek, gerçek uygulamada daha güvenli ve uzun bir token üretin)
            var token = Guid.NewGuid().ToString();

            // Burada token'ı veritabanına kaydedebilir ve expire süresi ekleyebilirsiniz

            // Reset linki (frontend veya ayrı bir web sayfası ile entegre edilecek)
            var resetLink = $"https://yourfrontend.com/reset-password?token={token}&email={user.Email}";

            // E-posta gönderme
            await _emailService.SendEmailAsync(
                user.Email,
                "Şifre Sıfırlama",
                $"Şifrenizi sıfırlamak için <a href='{resetLink}'>buraya tıklayın</a>."
            );

            return Ok(new { message = "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." });
        }
    }
} 