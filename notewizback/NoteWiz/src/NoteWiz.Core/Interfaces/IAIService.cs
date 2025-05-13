using System.Threading.Tasks;
using NoteWiz.Core.Models.AI;

namespace NoteWiz.Core.Interfaces
{
    public interface IAIService
    {
        /// <summary>
        /// Sends a prompt to the AI service and gets a response
        /// </summary>
        /// <param name="request">The AI chat request containing the prompt and optional parameters</param>
        /// <returns>AI-generated response</returns>
        Task<AIChatResponse> GetResponseAsync(AIChatRequest request);
        
        /// <summary>
        /// Records an AI interaction for logging purposes
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="request">The AI chat request</param>
        /// <param name="response">The AI chat response</param>
        /// <returns>Whether the interaction was successfully logged</returns>
        Task<bool> LogInteractionAsync(int userId, AIChatRequest request, AIChatResponse response);

        Task<string> AskQuestionAsync(string question);
    }
} 