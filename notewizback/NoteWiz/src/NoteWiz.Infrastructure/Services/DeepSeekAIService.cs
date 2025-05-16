using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using NoteWiz.Core.Models.AI;

namespace NoteWiz.Infrastructure.Services
{
    public class DeepSeekAIService : IAIService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<DeepSeekAIService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IUnitOfWork _unitOfWork;
        private readonly string _apiKey;
        private readonly string _model;

        public DeepSeekAIService(
            HttpClient httpClient,
            ILogger<DeepSeekAIService> logger,
            IConfiguration configuration,
            IUnitOfWork unitOfWork)
        {
            _httpClient = httpClient;
            _logger = logger;
            _configuration = configuration;
            _unitOfWork = unitOfWork;
            
            _apiKey = _configuration["AI:ApiKey"];
            _model = _configuration["AI:Model"] ?? "gpt-4";
            
            _httpClient.DefaultRequestHeaders.Accept.Clear();
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        }

        public async Task<AIChatResponse> GetResponseAsync(AIChatRequest request)
        {
            var startTime = DateTime.UtcNow;
            var response = new AIChatResponse { IsSuccess = false };
            
            try
            {
                var requestBody = new
                {
                    model = _model,
                    messages = new[]
                    {
                        new { role = "user", content = request.Prompt }
                    },
                    max_tokens = request.MaxTokens ?? 1024,
                    temperature = request.Temperature ?? 0.7f
                };

                var jsonRequest = JsonConvert.SerializeObject(requestBody);
                var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");
                
                var httpResponse = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);
                
                if (httpResponse.IsSuccessStatusCode)
                {
                    var jsonResponse = await httpResponse.Content.ReadAsStringAsync();
                    dynamic responseData = JsonConvert.DeserializeObject(jsonResponse);
                    
                    response.IsSuccess = true;
                    response.ResponseText = responseData.choices[0].message.content.ToString();
                    response.TokensUsed = responseData.usage.total_tokens;
                }
                else
                {
                    var errorContent = await httpResponse.Content.ReadAsStringAsync();
                    _logger.LogError($"OpenAI API Error: {httpResponse.StatusCode}, {errorContent}");
                    response.ErrorMessage = $"API Error: {httpResponse.StatusCode}, {errorContent}";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling OpenAI API");
                response.ErrorMessage = $"Exception: {ex.Message}";
            }
            
            response.ProcessingTime = (DateTime.UtcNow - startTime).TotalMilliseconds;
            response.Timestamp = DateTime.UtcNow;
            
            return response;
        }

        public async Task<bool> LogInteractionAsync(int userId, AIChatRequest request, AIChatResponse response)
        {
            try
            {
                var aiLog = new AIInteractionLog
                {
                    UserId = userId,
                    InputPrompt = request.Prompt,
                    AIResponse = response.ResponseText,
                    TokensUsed = response.TokensUsed,
                    ProcessingTime = (int)response.ProcessingTime,
                    CreatedAt = response.Timestamp,
                    ModelUsed = _model,
                    InteractionType = "text-prompt",
                    Cost = CalculateCost(response.TokensUsed)
                };
                
                await _unitOfWork.AIInteractionLogs.AddAsync(aiLog);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging AI interaction");
                return false;
            }
        }
        
        private decimal CalculateCost(int tokens)
        {
            // GPT-4 için yaklaşık maliyet (1000 token başına $0.03)
            return tokens * 0.00003m;
        }

        public async Task<string> AskQuestionAsync(string question)
        {
            var request = new AIChatRequest { Prompt = question };
            var response = await GetResponseAsync(request);
            return response?.ResponseText ?? string.Empty;
        }
    }
} 