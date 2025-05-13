using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteWiz.API.DTOs;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using NoteWiz.Infrastructure.Data;

namespace NoteWiz.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserRepository _userRepository;
        private readonly NoteWizDbContext _context;

        public UsersController(IAuthService authService, IUserRepository userRepository, NoteWizDbContext context)
        {
            _authService = authService;
            _userRepository = userRepository;
            _context = context;
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
        public async Task<ActionResult<string>> Login([FromBody] LoginDTO dto)
        {
            var (success, token) = await _authService.LoginAsync(dto.Email, dto.Password);
            if (!success)
                return Unauthorized("Invalid email or password");

            return Ok(new { token });
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
    }
} 