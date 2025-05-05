using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteWiz.API.DTOs;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using System.Security.Claims;

namespace NoteWiz.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FriendshipsController : ControllerBase
    {
        private readonly IFriendshipService _friendshipService;

        public FriendshipsController(IFriendshipService friendshipService)
        {
            _friendshipService = friendshipService;
        }

        /// <summary>
        /// Send a friend request
        /// </summary>
        /// <param name="dto">Friend request data</param>
        /// <returns>Created friendship details</returns>
        /// <response code="200">Returns the created friendship details</response>
        /// <response code="400">If the request is invalid</response>
        [HttpPost("requests")]
        [ProducesResponseType(typeof(FriendshipDTO), 200)]
        [ProducesResponseType(400)]
        public async Task<ActionResult<FriendshipDTO>> SendFriendRequest([FromBody] CreateFriendshipDTO dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var friendship = await _friendshipService.SendFriendRequestAsync(userId, dto.FriendId);
            
            if (friendship == null)
                return BadRequest();

            return Ok(MapToFriendshipDTO(friendship));
        }

        /// <summary>
        /// Accept a friend request
        /// </summary>
        /// <param name="requestId">Friend request ID</param>
        /// <returns>Updated friendship details</returns>
        /// <response code="200">Returns the updated friendship details</response>
        /// <response code="404">If the request is not found</response>
        [HttpPost("requests/{requestId}/accept")]
        [ProducesResponseType(typeof(FriendshipDTO), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<FriendshipDTO>> AcceptFriendRequest(int requestId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var friendship = await _friendshipService.AcceptFriendRequestAsync(requestId, userId);
            
            if (friendship == null)
                return NotFound();

            return Ok(MapToFriendshipDTO(friendship));
        }

        /// <summary>
        /// Reject a friend request
        /// </summary>
        /// <param name="requestId">Friend request ID</param>
        /// <returns>No content</returns>
        /// <response code="204">If the request was successfully rejected</response>
        /// <response code="404">If the request is not found</response>
        [HttpPost("requests/{requestId}/reject")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<ActionResult> RejectFriendRequest(int requestId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _friendshipService.RejectFriendRequestAsync(requestId, userId);
            
            if (!result)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Get all friend requests for the current user
        /// </summary>
        /// <returns>List of friend requests</returns>
        /// <response code="200">Returns the list of friend requests</response>
        [HttpGet("requests")]
        [ProducesResponseType(typeof(IEnumerable<FriendshipDTO>), 200)]
        public async Task<ActionResult<IEnumerable<FriendshipDTO>>> GetFriendRequests()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var requests = await _friendshipService.GetFriendRequestsAsync(userId);
            var requestDtos = requests.Select(MapToFriendshipDTO);
            return Ok(requestDtos);
        }

        /// <summary>
        /// Get all friends of the current user
        /// </summary>
        /// <returns>List of friends</returns>
        /// <response code="200">Returns the list of friends</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<FriendshipDTO>), 200)]
        public async Task<ActionResult<IEnumerable<FriendshipDTO>>> GetFriends()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var friends = await _friendshipService.GetFriendsAsync(userId);
            var friendDtos = friends.Select(MapToFriendshipDTO);
            return Ok(friendDtos);
        }

        /// <summary>
        /// Remove a friend
        /// </summary>
        /// <param name="friendId">Friend ID</param>
        /// <returns>No content</returns>
        /// <response code="204">If the friend was successfully removed</response>
        /// <response code="404">If the friendship is not found</response>
        [HttpDelete("{friendId}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<ActionResult> RemoveFriend(int friendId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var result = await _friendshipService.RemoveFriendAsync(userId, friendId);
            
            if (!result)
                return NotFound();

            return NoContent();
        }

        private static FriendshipDTO MapToFriendshipDTO(Friendship friendship)
        {
            return new FriendshipDTO
            {
                Id = friendship.Id,
                UserId = friendship.UserId,
                FriendId = friendship.FriendId,
                Status = friendship.Status,
                CreatedAt = friendship.CreatedAt,
                UpdatedAt = friendship.UpdatedAt,
                Friend = friendship.Friend != null ? new UserResponseDTO
                {
                    Id = friendship.Friend.Id,
                    Username = friendship.Friend.Username,
                    Email = friendship.Friend.Email,
                    FullName = friendship.Friend.FullName,
                    CreatedAt = friendship.Friend.CreatedAt
                } : null
            };
        }
    }
} 