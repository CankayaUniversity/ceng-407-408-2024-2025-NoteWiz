using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using NoteWiz.Core.Interfaces;
using NoteWiz.Core.Models.AI;
using System.Security.Claims;

namespace NoteWiz.API.Hubs
{
    [Authorize]
    public class AIHub : Hub
    {
        private readonly IAIService _aiService;
        private readonly ILogger<AIHub> _logger;

        public AIHub(IAIService aiService, ILogger<AIHub> logger)
        {
            _aiService = aiService;
            _logger = logger;
        }

        public async Task SendPrompt(string prompt)
        {
            try
            {
                var userId = int.Parse(Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var request = new AIChatRequest { Prompt = prompt };
                
                var response = await _aiService.GetResponseAsync(request);
                
                if (response.IsSuccess)
                {
                    await _aiService.LogInteractionAsync(userId, request, response);
                    await Clients.Caller.SendAsync("ReceiveResponse", response);
                }
                else
                {
                    await Clients.Caller.SendAsync("ReceiveError", response.ErrorMessage);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AI Hub");
                await Clients.Caller.SendAsync("ReceiveError", "An error occurred while processing your request");
            }
        }

        public async Task GetNoteSuggestions(int noteId, string prompt)
        {
            try
            {
                var userId = int.Parse(Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var request = new AIChatRequest 
                { 
                    Prompt = $"For note ID {noteId}, {prompt}" 
                };
                
                var response = await _aiService.GetResponseAsync(request);
                
                if (response.IsSuccess)
                {
                    await _aiService.LogInteractionAsync(userId, request, response);
                    await Clients.Caller.SendAsync("ReceiveNoteSuggestion", response);
                }
                else
                {
                    await Clients.Caller.SendAsync("ReceiveError", response.ErrorMessage);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AI Hub note suggestions");
                await Clients.Caller.SendAsync("ReceiveError", "An error occurred while processing your request");
            }
        }
    }
} 