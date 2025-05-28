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
        private const string OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

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
            
            _apiKey = _configuration["AppSettings:AI:ApiKey"] ?? _configuration["AI:ApiKey"];
            _model = _configuration["AppSettings:AI:Model"] ?? _configuration["AI:Model"] ?? "gpt-4";
            
            if (string.IsNullOrEmpty(_apiKey))
            {
                _logger.LogError("OpenAI API key is not configured");
                throw new InvalidOperationException("OpenAI API key is not configured");
            }
            
            _httpClient.DefaultRequestHeaders.Accept.Clear();
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            
            _logger.LogInformation("DeepSeekAIService initialized with model: {Model}", _model);
        }

        public async Task<AIChatResponse> GetResponseAsync(AIChatRequest request)
        {
            var startTime = DateTime.UtcNow;
            var response = new AIChatResponse { IsSuccess = false };
            
            try
            {
                if (string.IsNullOrEmpty(request.Prompt))
                {
                    response.ErrorMessage = "Prompt cannot be empty";
                    return response;
                }

                _logger.LogDebug("Sending request to OpenAI API. Prompt: {Prompt}", request.Prompt);
                
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
                
                _logger.LogDebug("Request body: {RequestBody}", jsonRequest);
                
                var httpResponse = await _httpClient.PostAsync(OPENAI_API_URL, content);
                var responseContent = await httpResponse.Content.ReadAsStringAsync();
                
                _logger.LogDebug("OpenAI API Response Status: {StatusCode}", httpResponse.StatusCode);
                _logger.LogDebug("OpenAI API Response Content: {Content}", responseContent);
                
                if (httpResponse.IsSuccessStatusCode)
                {
                    try
                    {
                        dynamic responseData = JsonConvert.DeserializeObject(responseContent);
                        
                        response.IsSuccess = true;
                        response.ResponseText = responseData.choices[0].message.content.ToString();
                        response.TokensUsed = responseData.usage.total_tokens;
                        _logger.LogInformation("Successfully received response from OpenAI API. Tokens used: {Tokens}", response.TokensUsed);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error parsing OpenAI API response");
                        response.ErrorMessage = "Error parsing API response";
                    }
                }
                else
                {
                    _logger.LogError("OpenAI API Error: {StatusCode}, {Content}", httpResponse.StatusCode, responseContent);
                    response.ErrorMessage = $"API Error: {httpResponse.StatusCode}, {responseContent}";
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Network error while calling OpenAI API");
                response.ErrorMessage = "Network error while calling API";
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
                _logger.LogDebug("Successfully logged AI interaction for user {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging AI interaction for user {UserId}", userId);
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
            if (string.IsNullOrEmpty(question))
            {
                _logger.LogWarning("Empty question received");
                return string.Empty;
            }

            _logger.LogDebug("Asking question: {Question}", question);
            var request = new AIChatRequest { Prompt = question };
            var response = await GetResponseAsync(request);
            
            if (!response.IsSuccess)
            {
                _logger.LogError("Failed to get AI response: {Error}", response.ErrorMessage);
                return $"Error: {response.ErrorMessage}";
            }
            
            return response.ResponseText;
        }
    }
} 