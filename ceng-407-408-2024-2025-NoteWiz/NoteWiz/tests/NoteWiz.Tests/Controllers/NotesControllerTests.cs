using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NoteWiz.API.Controllers;
using NoteWiz.API.DTOs;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using Xunit;

namespace NoteWiz.Tests.Controllers
{
    public class NotesControllerTests
    {
        private readonly Mock<INoteService> _mockNoteService;
        private readonly NotesController _controller;
        private readonly int _userId = 1;

        public NotesControllerTests()
        {
            _mockNoteService = new Mock<INoteService>();
            _controller = new NotesController(_mockNoteService.Object);

            // Setup ClaimsPrincipal
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, _userId.ToString())
            };
            var identity = new ClaimsIdentity(claims);
            var claimsPrincipal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };
        }

        [Fact]
        public async Task UpdateNoteCover_ValidData_ReturnsOkResult()
        {
            // Arrange
            var noteId = 1;
            var updateCoverDto = new UpdateCoverDTO
            {
                CoverType = CoverType.Color,
                CoverColor = "#FF5733",
                CoverPosition = CoverPosition.Top
            };

            var updatedNote = new Note
            {
                Id = noteId,
                UserId = _userId,
                Title = "Test Note",
                CoverType = updateCoverDto.CoverType,
                CoverColor = updateCoverDto.CoverColor,
                CoverPosition = updateCoverDto.CoverPosition
            };

            _mockNoteService.Setup(s => s.UpdateNoteCoverAsync(
                noteId,
                _userId,
                updateCoverDto.CoverType,
                updateCoverDto.CoverColor,
                updateCoverDto.CoverImageUrl,
                updateCoverDto.CoverPosition
            )).ReturnsAsync(updatedNote);

            // Act
            var result = await _controller.UpdateNoteCover(noteId, updateCoverDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<NoteResponseDTO>(okResult.Value);
            Assert.Equal(updateCoverDto.CoverType, returnValue.CoverType);
            Assert.Equal(updateCoverDto.CoverColor, returnValue.CoverColor);
            Assert.Equal(updateCoverDto.CoverPosition, returnValue.CoverPosition);
        }

        [Fact]
        public async Task UpdateNoteCover_InvalidNote_ReturnsNotFound()
        {
            // Arrange
            var noteId = 1;
            var updateCoverDto = new UpdateCoverDTO
            {
                CoverType = CoverType.Color,
                CoverColor = "#FF5733",
                CoverPosition = CoverPosition.Top
            };

            _mockNoteService.Setup(s => s.UpdateNoteCoverAsync(
                noteId,
                _userId,
                updateCoverDto.CoverType,
                updateCoverDto.CoverColor,
                updateCoverDto.CoverImageUrl,
                updateCoverDto.CoverPosition
            )).ReturnsAsync((Note)null);

            // Act
            var result = await _controller.UpdateNoteCover(noteId, updateCoverDto);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task RemoveNoteCover_ValidData_ReturnsNoContent()
        {
            // Arrange
            var noteId = 1;
            _mockNoteService.Setup(s => s.RemoveNoteCoverAsync(noteId, _userId))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.RemoveNoteCover(noteId);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task RemoveNoteCover_InvalidNote_ReturnsNotFound()
        {
            // Arrange
            var noteId = 1;
            _mockNoteService.Setup(s => s.RemoveNoteCoverAsync(noteId, _userId))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.RemoveNoteCover(noteId);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task GetNotesByCoverType_ReturnsOkResult()
        {
            // Arrange
            var coverType = CoverType.Color;
            var notes = new List<Note>
            {
                new Note { Id = 1, UserId = _userId, CoverType = CoverType.Color },
                new Note { Id = 2, UserId = _userId, CoverType = CoverType.Color }
            };

            _mockNoteService.Setup(s => s.GetNotesByCoverTypeAsync(_userId, coverType))
                .ReturnsAsync(notes);

            // Act
            var result = await _controller.GetNotesByCoverType(coverType);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<NoteResponseDTO>>(okResult.Value);
            Assert.Equal(2, returnValue.Count());
            Assert.All(returnValue, note => Assert.Equal(coverType, note.CoverType));
        }
    }
} 