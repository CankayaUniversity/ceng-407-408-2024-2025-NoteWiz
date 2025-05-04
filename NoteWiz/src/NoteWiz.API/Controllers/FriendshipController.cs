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

namespace NoteWiz.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FriendshipController : ControllerBase
    {
        private readonly IFriendshipService _friendshipService;

        public FriendshipController(IFriendshipService friendshipService)
        {
            _friendshipService = friendshipService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FriendshipResponseDTO>>> GetFriends()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var friendships = await _friendshipService.GetUserFriendshipsAsync(userId);
            return Ok(friendships.Select(f => MapToFriendshipResponseDTO(f)));
        }

        [HttpGet("requests")]
        public async Task<ActionResult<IEnumerable<FriendshipRequestResponseDTO>>> GetFriendRequests()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var requests = await _friendshipService.GetFriendRequestsAsync(userId);
            return Ok(requests.Select(r => MapToFriendshipRequestResponseDTO(r)));
        }

        [HttpPost("requests")]
        public async Task<ActionResult<FriendshipRequestResponseDTO>> SendFriendRequest([FromBody] FriendshipRequestDTO dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var request = await _friendshipService.SendFriendRequestAsync(userId, dto.ReceiverId);
            return CreatedAtAction(nameof(GetFriendRequests), new { id = request.Id }, MapToFriendshipRequestResponseDTO(request));
        }

        [HttpPut("requests/{id}")]
        public async Task<IActionResult> RespondToFriendRequest(int id, [FromBody] UpdateFriendshipRequestDTO dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
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
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var friendship = await _friendshipService.GetFriendshipAsync(userId, friendId);

            if (friendship == null)
                return NotFound();

            await _friendshipService.RemoveFriendshipAsync(friendship);
            return NoContent();
        }

        private FriendshipResponseDTO MapToFriendshipResponseDTO(Friendship friendship)
        {
            return new FriendshipResponseDTO
            {
                Id = friendship.Id,
                UserId = friendship.UserId,
                FriendId = friendship.FriendId,
                CreatedAt = friendship.CreatedAt,
                Friend = friendship.Friend != null ? new UserResponseDTO
                {
                    Id = friendship.Friend.Id,
                    Username = friendship.Friend.Username,
                    Email = friendship.Friend.Email,
                    FullName = friendship.Friend.FullName,
                    CreatedAt = friendship.Friend.CreatedAt
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
} 