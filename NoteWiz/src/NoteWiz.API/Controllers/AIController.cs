using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteWiz.Core.Interfaces;
using NoteWiz.Core.Models.AI;
using System.Security.Claims;

namespace NoteWiz.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AIController : ControllerBase
    {
        private readonly IAIService _aiService;
        private readonly ILogger<AIController> _logger;

        public AIController(IAIService aiService, ILogger<AIController> logger)
        {
            _aiService = aiService;
            _logger = logger;
        }

        /// <summary>
        /// Sends a prompt to the AI and gets a response
        /// </summary>
        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] AIChatRequest request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var response = await _aiService.GetResponseAsync(request);
                
                if (response.IsSuccess)
                {
                    // Log the interaction
                    await _aiService.LogInteractionAsync(userId, request, response);
                    return Ok(response);
                }
                
                return BadRequest(new { error = response.ErrorMessage });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AI chat endpoint");
                return StatusCode(500, new { error = "An error occurred while processing your request" });
            }
        }

        /// <summary>
        /// Gets AI suggestions for a note
        /// </summary>
        [HttpPost("notes/{noteId}/suggest")]
        public async Task<IActionResult> GetNoteSuggestions(int noteId, [FromBody] AIChatRequest request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                
                // Add context about the note to the prompt
                request.Prompt = $"For note ID {noteId}, {request.Prompt}";
                
                var response = await _aiService.GetResponseAsync(request);
                
                if (response.IsSuccess)
                {
                    // Log the interaction
                    await _aiService.LogInteractionAsync(userId, request, response);
                    return Ok(response);
                }
                
                return BadRequest(new { error = response.ErrorMessage });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in note suggestions endpoint");
                return StatusCode(500, new { error = "An error occurred while processing your request" });
            }
        }
    }
} 