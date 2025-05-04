using System;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Core.Entities
{
    public class FriendshipRequest : IEntity
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public FriendshipRequestStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual User Sender { get; set; }
        public virtual User Receiver { get; set; }

        public FriendshipRequest()
        {
            Status = FriendshipRequestStatus.Pending;
            CreatedAt = DateTime.UtcNow;
        }
    }

    public enum FriendshipRequestStatus
    {
        Pending,
        Accepted,
        Rejected
    }
} 