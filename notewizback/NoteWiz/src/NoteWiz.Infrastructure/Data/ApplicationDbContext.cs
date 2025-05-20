using Microsoft.EntityFrameworkCore;
using NoteWiz.Core.Entities;

namespace NoteWiz.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Note> Notes { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<NoteDrawing> NoteDrawings { get; set; }
        public DbSet<NoteImage> NoteImages { get; set; }
        public DbSet<NoteShare> NoteShares { get; set; }
        public DbSet<TaskItem> Tasks { get; set; }
        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<AuthToken> AuthTokens { get; set; }
        public DbSet<UserDevice> UserDevices { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<NotePdfPage> NotePdfPages { get; set; }
        public DbSet<NoteText> NoteTexts { get; set; }
        public DbSet<NoteTemplate> NoteTemplates { get; set; }
        public DbSet<NoteAISelection> NoteAISelections { get; set; }
        public DbSet<NoteAIPopup> NoteAIPopups { get; set; }
        public DbSet<AIInteractionLog> AIInteractionLogs { get; set; }
        public DbSet<FriendshipRequest> FriendshipRequests { get; set; }
        public DbSet<Category> Categories { get; set; }
<<<<<<< HEAD
        public DbSet<Folder> Folders { get; set; }
        public DbSet<FolderNote> FolderNotes { get; set; }
=======
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TaskItem>().ToTable("TaskItems");
            // Configure relationship between User and Note
            modelBuilder.Entity<Note>(entity =>
            {
                entity.HasOne(n => n.User)
                    .WithMany(u => u.Notes)
                    .HasForeignKey(n => n.UserId)
<<<<<<< HEAD
                    .OnDelete(DeleteBehavior.NoAction);
=======
                    .OnDelete(DeleteBehavior.Cascade);
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

                entity.Property(n => n.Color)
                    .HasColumnType("nvarchar(7)")
                    .HasDefaultValue("#FFFFFF");

                entity.Property(n => n.IsPinned)
                    .HasDefaultValue(false);

                entity.Property(n => n.IsPrivate)
                    .HasDefaultValue(true);

<<<<<<< HEAD
                entity.Property(n => n.Tags);
=======
                entity.Property(n => n.Tags)
                    .HasConversion(
                        v => string.Join(',', v),
                        v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                    );

                // Offline desteği için gerekli alanlar
                entity.Property(n => n.IsOffline).HasDefaultValue(false);
                entity.Property(n => n.SyncStatus).HasDefaultValue("synced");
                entity.Property(n => n.LastModifiedAt).HasDefaultValueSql("GETUTCDATE()");
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
            });

            // Configure relationship between Note and NoteDrawing
            modelBuilder.Entity<NoteDrawing>()
                .HasOne(nd => nd.Note)
                .WithMany(n => n.NoteDrawings)
                .HasForeignKey(nd => nd.NoteId)
<<<<<<< HEAD
                .OnDelete(DeleteBehavior.NoAction);
=======
                .OnDelete(DeleteBehavior.Cascade);
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

            // Configure relationship between Note and NoteImage
            modelBuilder.Entity<NoteImage>()
                .HasOne(ni => ni.Note)
                .WithMany(n => n.NoteImages)
                .HasForeignKey(ni => ni.NoteId)
<<<<<<< HEAD
                .OnDelete(DeleteBehavior.NoAction);
=======
                .OnDelete(DeleteBehavior.Cascade);
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

            // Configure relationship between Note and NoteShare
            modelBuilder.Entity<NoteShare>()
                .HasOne(ns => ns.Note)
                .WithMany(n => n.SharedWith)
                .HasForeignKey(ns => ns.NoteId)
<<<<<<< HEAD
                .OnDelete(DeleteBehavior.NoAction);
=======
                .OnDelete(DeleteBehavior.Cascade);
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

            // Configure relationship between User and NoteShare
            modelBuilder.Entity<NoteShare>()
                .HasOne(ns => ns.SharedWithUser)
                .WithMany(u => u.SharedWithMe)
                .HasForeignKey(ns => ns.SharedWithUserId)
<<<<<<< HEAD
                .OnDelete(DeleteBehavior.NoAction);
=======
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete conflicts
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

            // Configure relationship between User and TaskItem
            modelBuilder.Entity<TaskItem>()
                .HasOne(t => t.User)
                .WithMany(u => u.Tasks)
                .HasForeignKey(t => t.UserId)
<<<<<<< HEAD
                .OnDelete(DeleteBehavior.NoAction);
=======
                .OnDelete(DeleteBehavior.Cascade);
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

            // Configure relationships for Friendship entity
            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.User)
                .WithMany(u => u.FriendshipsInitiated)
                .HasForeignKey(f => f.UserId)
<<<<<<< HEAD
                .OnDelete(DeleteBehavior.NoAction);
=======
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete conflicts
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.Friend)
                .WithMany(u => u.FriendshipsReceived)
                .HasForeignKey(f => f.FriendId)
<<<<<<< HEAD
                .OnDelete(DeleteBehavior.NoAction);
=======
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete conflicts
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

            // Configure relationship between User and AuthToken
            modelBuilder.Entity<AuthToken>()
                .HasOne(at => at.User)
                .WithMany(u => u.AuthTokens)
                .HasForeignKey(at => at.UserId)
<<<<<<< HEAD
                .OnDelete(DeleteBehavior.NoAction);
=======
                .OnDelete(DeleteBehavior.Cascade);
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

            // Configure relationship between User and UserDevice
            modelBuilder.Entity<UserDevice>()
                .HasOne(ud => ud.User)
                .WithMany(u => u.Devices)
                .HasForeignKey(ud => ud.UserId)
<<<<<<< HEAD
                .OnDelete(DeleteBehavior.NoAction);
=======
                .OnDelete(DeleteBehavior.Cascade);
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

            // Configure relationship between User and Notification
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
<<<<<<< HEAD
                .OnDelete(DeleteBehavior.NoAction);
=======
                .OnDelete(DeleteBehavior.Cascade);
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

            // User entity configuration
            modelBuilder.Entity<User>()
                .HasMany(u => u.Notes)
                .WithOne(n => n.User)
                .HasForeignKey(n => n.UserId)
<<<<<<< HEAD
                .OnDelete(DeleteBehavior.NoAction);
=======
                .OnDelete(DeleteBehavior.Cascade);
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

            modelBuilder.Entity<User>()
                .HasMany(u => u.Documents)
                .WithOne(d => d.User)
                .HasForeignKey(d => d.UserId)
<<<<<<< HEAD
                .OnDelete(DeleteBehavior.NoAction);
=======
                .OnDelete(DeleteBehavior.Cascade);
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

            // Document entity configuration
            modelBuilder.Entity<Document>()
                .HasOne(d => d.User)
                .WithMany(u => u.Documents)
                .HasForeignKey(d => d.UserId)
<<<<<<< HEAD
                .OnDelete(DeleteBehavior.NoAction);
=======
                .OnDelete(DeleteBehavior.Cascade);
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

            modelBuilder.Entity<Document>()
                .HasMany(d => d.Notes)
                .WithOne(n => n.Document)
                .HasForeignKey(n => n.DocumentId)
<<<<<<< HEAD
                .OnDelete(DeleteBehavior.NoAction);
=======
                .OnDelete(DeleteBehavior.Cascade);
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

            // Category entity configuration
            modelBuilder.Entity<Category>()
                .HasOne(c => c.User)
<<<<<<< HEAD
                .WithMany(u => u.Categories)
                .HasForeignKey(c => c.UserId)
=======
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Category>()
                .HasMany(c => c.Documents)
                .WithOne(d => d.Category)
                .HasForeignKey(d => d.CategoryId)
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Category>()
                .HasMany(c => c.Notes)
                .WithOne(n => n.Category)
                .HasForeignKey(n => n.CategoryId)
                .OnDelete(DeleteBehavior.NoAction);
<<<<<<< HEAD

            modelBuilder.Entity<Folder>()
                .HasMany(f => f.Notes)
                .WithOne(n => n.Folder)
                .HasForeignKey(n => n.FolderId)
                .OnDelete(DeleteBehavior.NoAction);

            // Many-to-many: Folder <-> Note via FolderNote
            modelBuilder.Entity<FolderNote>()
                .HasKey(fn => new { fn.FolderId, fn.NoteId });

            modelBuilder.Entity<FolderNote>()
                .HasOne(fn => fn.Folder)
                .WithMany(f => f.FolderNotes)
                .HasForeignKey(fn => fn.FolderId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<FolderNote>()
                .HasOne(fn => fn.Note)
                .WithMany(n => n.FolderNotes)
                .HasForeignKey(fn => fn.NoteId)
                .OnDelete(DeleteBehavior.NoAction);

            // Configure FriendshipRequest relationships
            modelBuilder.Entity<FriendshipRequest>()
                .HasOne(f => f.Sender)
                .WithMany(u => u.FriendshipRequestsSent)
                .HasForeignKey(f => f.SenderId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<FriendshipRequest>()
                .HasOne(f => f.Receiver)
                .WithMany(u => u.FriendshipRequestsReceived)
                .HasForeignKey(f => f.ReceiverId)
                .OnDelete(DeleteBehavior.NoAction);
=======
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
        }
    }
} 