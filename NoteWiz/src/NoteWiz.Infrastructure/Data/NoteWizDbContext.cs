using Microsoft.EntityFrameworkCore;
using NoteWiz.Core.Entities;

namespace NoteWiz.Infrastructure.Data
{
    public class NoteWizDbContext : DbContext
    {
        public NoteWizDbContext(DbContextOptions<NoteWizDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Note> Notes { get; set; }
        public DbSet<TaskItem> Tasks { get; set; }
        public DbSet<NoteShare> NoteShares { get; set; }
        public DbSet<NoteDrawing> NoteDrawings { get; set; }
        public DbSet<NoteImage> NoteImages { get; set; }
        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<DocumentUpload> DocumentUploads { get; set; }
        public DbSet<AuthToken> AuthTokens { get; set; }
        public DbSet<UserDevice> UserDevices { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TaskItem>().ToTable("TaskItems");
            // Configure relationships and constraints
            modelBuilder.Entity<Note>(entity =>
            {
                entity.HasOne(n => n.User)
                    .WithMany(u => u.Notes)
                    .HasForeignKey(n => n.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(n => n.Color)
                    .HasColumnType("nvarchar(7)")
                    .HasDefaultValue("#FFFFFF");

                entity.Property(n => n.IsPinned)
                    .HasDefaultValue(false);

                entity.Property(n => n.CoverImageUrl)
                    .IsRequired(false);

                entity.Property(n => n.Tags)
                    .HasConversion(
                        v => string.Join(',', v),
                        v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                    );
            });

            modelBuilder.Entity<TaskItem>()
                .HasOne(t => t.User)
                .WithMany(u => u.Tasks)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<NoteShare>()
                .HasOne(ns => ns.Note)
                .WithMany(n => n.SharedWith)
                .HasForeignKey(ns => ns.NoteId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<NoteShare>()
                .HasOne(ns => ns.SharedWithUser)
                .WithMany(u => u.SharedWithMe)
                .HasForeignKey(ns => ns.SharedWithUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.User)
                .WithMany(u => u.FriendshipsInitiated)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.Friend)
                .WithMany(u => u.FriendshipsReceived)
                .HasForeignKey(f => f.FriendId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 