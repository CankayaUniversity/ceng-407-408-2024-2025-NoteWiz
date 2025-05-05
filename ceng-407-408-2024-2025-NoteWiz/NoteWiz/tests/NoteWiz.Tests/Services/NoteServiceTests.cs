using System;
using System.Threading.Tasks;
using Moq;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using NoteWiz.Core.Services;
using Xunit;

namespace NoteWiz.Tests.Services
{
    public class NoteServiceTests
    {
        private readonly Mock<INoteRepository> _mockNoteRepository;
        private readonly Mock<IUserRepository> _mockUserRepository;
        private readonly NoteService _noteService;

        public NoteServiceTests()
        {
            _mockNoteRepository = new Mock<INoteRepository>();
            _mockUserRepository = new Mock<IUserRepository>();
            _noteService = new NoteService(_mockNoteRepository.Object, _mockUserRepository.Object);
        }

        [Fact]
        public async Task UpdateNoteCover_ValidData_ReturnsUpdatedNote()
        {
            // Arrange
            var noteId = 1;
            var userId = 1;
            var coverType = CoverType.Color;
            var coverColor = "#FF5733";
            var coverPosition = CoverPosition.Top;

            var existingNote = new Note
            {
                Id = noteId,
                UserId = userId,
                Title = "Test Note"
            };

            var updatedNote = new Note
            {
                Id = noteId,
                UserId = userId,
                Title = "Test Note",
                CoverType = coverType,
                CoverColor = coverColor,
                CoverPosition = coverPosition
            };

            _mockNoteRepository.Setup(r => r.GetByIdAsync(noteId))
                .ReturnsAsync(existingNote);

            _mockNoteRepository.Setup(r => r.UpdateCoverAsync(noteId, coverType, coverColor, null, coverPosition))
                .ReturnsAsync(updatedNote);

            // Act
            var result = await _noteService.UpdateNoteCoverAsync(noteId, userId, coverType, coverColor, null, coverPosition);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(coverType, result.CoverType);
            Assert.Equal(coverColor, result.CoverColor);
            Assert.Equal(coverPosition, result.CoverPosition);
        }

        [Fact]
        public async Task UpdateNoteCover_InvalidUserId_ReturnsNull()
        {
            // Arrange
            var noteId = 1;
            var userId = 1;
            var invalidUserId = 2;
            var coverType = CoverType.Color;
            var coverColor = "#FF5733";
            var coverPosition = CoverPosition.Top;

            var existingNote = new Note
            {
                Id = noteId,
                UserId = userId,
                Title = "Test Note"
            };

            _mockNoteRepository.Setup(r => r.GetByIdAsync(noteId))
                .ReturnsAsync(existingNote);

            // Act
            var result = await _noteService.UpdateNoteCoverAsync(noteId, invalidUserId, coverType, coverColor, null, coverPosition);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task RemoveNoteCover_ValidData_ReturnsTrue()
        {
            // Arrange
            var noteId = 1;
            var userId = 1;

            var existingNote = new Note
            {
                Id = noteId,
                UserId = userId,
                Title = "Test Note",
                CoverType = CoverType.Color,
                CoverColor = "#FF5733"
            };

            _mockNoteRepository.Setup(r => r.GetByIdAsync(noteId))
                .ReturnsAsync(existingNote);

            _mockNoteRepository.Setup(r => r.RemoveCoverAsync(noteId))
                .ReturnsAsync(true);

            // Act
            var result = await _noteService.RemoveNoteCoverAsync(noteId, userId);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task GetNotesByCoverType_ReturnsFilteredNotes()
        {
            // Arrange
            var userId = 1;
            var coverType = CoverType.Color;
            var notes = new List<Note>
            {
                new Note { Id = 1, UserId = userId, CoverType = CoverType.Color },
                new Note { Id = 2, UserId = userId, CoverType = CoverType.Image }
            };

            _mockNoteRepository.Setup(r => r.GetNotesByCoverTypeAsync(userId, coverType))
                .ReturnsAsync(notes.Where(n => n.CoverType == coverType));

            // Act
            var result = await _noteService.GetNotesByCoverTypeAsync(userId, coverType);

            // Assert
            Assert.Single(result);
            Assert.All(result, note => Assert.Equal(coverType, note.CoverType));
        }
    }
} 