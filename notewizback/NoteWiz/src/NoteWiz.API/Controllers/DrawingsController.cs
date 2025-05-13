using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteWiz.Core.Interfaces;
using NoteWiz.Core.Entities;

namespace NoteWiz.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DrawingsController : ControllerBase
    {
        private readonly IDrawingService _drawingService;

        public DrawingsController(IDrawingService drawingService)
        {
            _drawingService = drawingService;
        }

        public class DrawingSaveRequest
        {
            public required string DrawingData { get; set; }
        }

        [HttpPost("{noteId}")]
        public async Task<IActionResult> SaveDrawing(int noteId, [FromBody] DrawingSaveRequest request)
        {
            Console.WriteLine($"SaveDrawing endpoint called. noteId: {noteId}, drawingData: {request.DrawingData}");
            try
            {
                var drawing = await _drawingService.SaveDrawing(noteId, request.DrawingData);
                Console.WriteLine("Drawing saved successfully.");
                return Ok(drawing);
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine($"ArgumentException: {ex.Message}");
                return NotFound(ex.Message);
            }
            catch (Exception)
            {
                Console.WriteLine("An error occurred while saving the drawing");
                return StatusCode(500, "An error occurred while saving the drawing");
            }
        }

        [HttpGet("{noteId}")]
        public async Task<IActionResult> GetDrawings(int noteId)
        {
            try
            {
                var drawings = await _drawingService.GetDrawings(noteId);
                return Ok(drawings);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while retrieving drawings");
            }
        }

        [HttpDelete("{drawingId}")]
        public async Task<IActionResult> DeleteDrawing(int drawingId)
        {
            try
            {
                var result = await _drawingService.DeleteDrawing(drawingId);
                if (!result)
                {
                    return NotFound("Drawing not found");
                }
                return Ok();
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while deleting the drawing");
            }
        }

        [HttpPut("{drawingId}")]
        public async Task<IActionResult> UpdateDrawing(int drawingId, [FromBody] string drawingData)
        {
            try
            {
                var result = await _drawingService.UpdateDrawing(drawingId, drawingData);
                if (!result)
                {
                    return NotFound("Drawing not found");
                }
                return Ok();
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while updating the drawing");
            }
        }
    }
} 