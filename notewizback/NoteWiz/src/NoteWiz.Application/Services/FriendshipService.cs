using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using NoteWiz.Infrastructure.Data;
using Microsoft.Extensions.Logging;

namespace NoteWiz.Application.Services
{
    public class FriendshipService : IFriendshipService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<FriendshipService> _logger;

        public FriendshipService(IUnitOfWork unitOfWork, ILogger<FriendshipService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Friendship> GetFriendshipAsync(int userId, int friendId)
        {
            return await _unitOfWork.Friendships.GetFriendshipAsync(userId, friendId);
        }

        public async Task<IEnumerable<Friendship>> GetUserFriendshipsAsync(int userId)
        {
            return await _unitOfWork.Friendships.GetUserFriendshipsAsync(userId);
        }

        public async Task<FriendshipRequest> GetFriendRequestByIdAsync(int id)
        {
            return await _unitOfWork.FriendshipRequests.GetByIdAsync(id);
        }

        public async Task<IEnumerable<FriendshipRequest>> GetFriendRequestsAsync(int userId)
        {
            return await _unitOfWork.FriendshipRequests.GetFriendRequestsAsync(userId);
        }

        public async Task<FriendshipRequest> SendFriendRequestAsync(int senderId, int receiverId)
        {
            // Check if users are already friends
            var existingFriendship = await _unitOfWork.Friendships.GetFriendshipAsync(senderId, receiverId);
            if (existingFriendship != null)
                throw new InvalidOperationException("Users are already friends");

            // Check if there's a pending request
            var existingRequest = await _unitOfWork.FriendshipRequests.GetPendingRequestAsync(senderId, receiverId);
            if (existingRequest != null)
                throw new InvalidOperationException("Friend request already exists");

            var request = new FriendshipRequest
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Status = FriendshipRequestStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.FriendshipRequests.AddAsync(request);
            await _unitOfWork.SaveChangesAsync();

            return request;
        }

        public async Task RespondToFriendRequestAsync(FriendshipRequest request, string status)
        {
            _logger.LogInformation($"Friend request {request.Id} is being responded with status: {status}");
            if (request.Status != FriendshipRequestStatus.Pending)
            {
                _logger.LogWarning($"Request {request.Id} already responded.");
                throw new InvalidOperationException("Request has already been responded to");
            }

            if (status == "Accepted")
            {
                request.Status = FriendshipRequestStatus.Accepted;
                var friendship = new Friendship
                {
                    UserId = request.SenderId,
                    FriendId = request.ReceiverId,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Friendships.AddAsync(friendship);
                _logger.LogInformation($"Friendship created between {request.SenderId} and {request.ReceiverId}");
            }
            else if (status == "Rejected")
            {
                request.Status = FriendshipRequestStatus.Rejected;
                _logger.LogInformation($"Friend request {request.Id} rejected.");
            }
            else
            {
                _logger.LogError($"Invalid status: {status} for request {request.Id}");
                throw new ArgumentException("Invalid status", nameof(status));
            }

            request.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation($"Friend request {request.Id} updated and saved.");
        }

        public async Task RemoveFriendshipAsync(Friendship friendship)
        {
            _unitOfWork.Friendships.Remove(friendship);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<bool> AreUsersFriendsAsync(int userId1, int userId2)
        {
            var friendship = await _unitOfWork.Friendships.GetFriendshipAsync(userId1, userId2);
            return friendship != null;
        }
    }
} 