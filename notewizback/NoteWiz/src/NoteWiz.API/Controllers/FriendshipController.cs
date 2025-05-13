using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteWiz.API.DTOs;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using System.Security.Claims;
using System.Linq;
using System;
using Microsoft.EntityFrameworkCore;
using NoteWiz.Infrastructure.Data;

namespace NoteWiz.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FriendshipController : ControllerBase
    {
        private readonly IFriendshipService _friendshipService;
        private readonly NoteWizDbContext _context;

        public FriendshipController(IFriendshipService friendshipService, NoteWizDbContext context)
        {
            _friendshipService = friendshipService;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FriendshipResponseDTO>>> GetFriends()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                throw new UnauthorizedAccessException("User ID not found in claims");
            }
            var userId = int.Parse(userIdClaim.Value);
            var friendships = await _friendshipService.GetUserFriendshipsAsync(userId);
            var validFriendships = friendships
                .Select(f => MapToFriendshipResponseDTO(f, userId))
                .Where(dto => dto.Friend != null && dto.Friend.Id != 0);
            return Ok(validFriendships);
        }

        [HttpGet("requests")]
        public async Task<ActionResult<IEnumerable<FriendshipRequestResponseDTO>>> GetFriendRequests()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                throw new UnauthorizedAccessException("User ID not found in claims");
            }
            var userId = int.Parse(userIdClaim.Value);
            var requests = await _friendshipService.GetFriendRequestsAsync(userId);
            var incomingRequests = requests.Where(r => r.ReceiverId == userId && r.Status == FriendshipRequestStatus.Pending);
            return Ok(incomingRequests.Select(r => MapToFriendshipRequestResponseDTO(r)));
        }

        [HttpPost("requests")]
        public async Task<ActionResult<FriendshipRequestResponseDTO>> SendFriendRequest([FromBody] FriendshipRequestDTO dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
                throw new UnauthorizedAccessException("User ID not found in claims");
            var userId = int.Parse(userIdClaim.Value);
            var request = await _friendshipService.SendFriendRequestAsync(userId, dto.ReceiverId);
            return CreatedAtAction(nameof(GetFriendRequests), new { id = request.Id }, MapToFriendshipRequestResponseDTO(request));
        }

        [HttpPut("requests/{id}")]
        public async Task<IActionResult> RespondToFriendRequest(int id, [FromBody] UpdateFriendshipRequestDTO dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
                throw new UnauthorizedAccessException("User ID not found in claims");
            var userId = int.Parse(userIdClaim.Value);
            var request = await _friendshipService.GetFriendRequestByIdAsync(id);

            if (request == null)
                return NotFound();

            if (request.ReceiverId != userId)
                return Forbid();

            await _friendshipService.RespondToFriendRequestAsync(request, dto.Status);
            return NoContent();
        }

        [HttpDelete("{friendId}")]
        public async Task<IActionResult> RemoveFriend(int friendId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim?.Value == null)
            {
                throw new UnauthorizedAccessException("User ID not found in claims");
            }
            var userId = int.Parse(userIdClaim.Value);
            var friendship = await _friendshipService.GetFriendshipAsync(userId, friendId);

            if (friendship == null)
                return NotFound();

            await _friendshipService.RemoveFriendshipAsync(friendship);
            return NoContent();
        }

        private FriendshipResponseDTO MapToFriendshipResponseDTO(Friendship friendship, int userId)
        {
            var isUser = friendship.UserId == userId;
            var friendUser = isUser ? friendship.Friend : friendship.User;
            return new FriendshipResponseDTO
            {
                Id = friendship.Id,
                UserId = friendship.UserId,
                FriendId = friendship.FriendId,
                CreatedAt = friendship.CreatedAt,
                Friend = friendUser != null ? new UserResponseDTO
                {
                    Id = friendUser.Id,
                    Username = friendUser.Username ?? string.Empty,
                    Email = friendUser.Email ?? string.Empty,
                    FullName = friendUser.FullName ?? string.Empty,
                    CreatedAt = friendUser.CreatedAt
                } : new UserResponseDTO
                {
                    Id = 0,
                    Username = string.Empty,
                    Email = string.Empty,
                    FullName = string.Empty,
                    CreatedAt = DateTime.MinValue
                }
            };
        }

        private FriendshipRequestResponseDTO MapToFriendshipRequestResponseDTO(FriendshipRequest request)
        {
            return new FriendshipRequestResponseDTO
            {
                Id = request.Id,
                SenderId = request.SenderId,
                ReceiverId = request.ReceiverId,
                Status = request.Status.ToString(),
                CreatedAt = request.CreatedAt,
                Sender = request.Sender != null ? new UserResponseDTO
                {
                    Id = request.Sender.Id,
                    Username = request.Sender.Username,
                    Email = request.Sender.Email,
                    FullName = request.Sender.FullName,
                    CreatedAt = request.Sender.CreatedAt
                } : new UserResponseDTO
                {
                    Id = 0,
                    Username = string.Empty,
                    Email = string.Empty,
                    FullName = string.Empty,
                    CreatedAt = DateTime.MinValue
                },
                Receiver = request.Receiver != null ? new UserResponseDTO
                {
                    Id = request.Receiver.Id,
                    Username = request.Receiver.Username,
                    Email = request.Receiver.Email,
                    FullName = request.Receiver.FullName,
                    CreatedAt = request.Receiver.CreatedAt
                } : new UserResponseDTO
                {
                    Id = 0,
                    Username = string.Empty,
                    Email = string.Empty,
                    FullName = string.Empty,
                    CreatedAt = DateTime.MinValue
                }
            };
        }
    }

    public class FriendRequestDto
    {
        public int RequesterId { get; set; }
        public int TargetUserId { get; set; }
    }
} 