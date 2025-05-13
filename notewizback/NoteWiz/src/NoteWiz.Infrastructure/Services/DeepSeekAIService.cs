using System;
using System.Collections.Generic;
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
        private readonly string _apiEndpoint;

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
            
            // API anahtarını environment variable veya appsettings.json'dan oku
            _apiKey = _configuration["HuggingFace:ApiKey"] ?? Environment.GetEnvironmentVariable("HUGGINGFACE_API_KEY");
            _apiEndpoint = "https://api-inference.huggingface.co/models/google-bert/bert-large-uncased-whole-word-masking-finetuned-squad";
            
            // HTTP istemcisini yapılandır
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
                // Hugging Face question-answering modeli için uygun format
                var question = request.Prompt;
                var context = request.Context ?? request.Prompt; // Eğer context yoksa prompt'u kullan
                var requestBody = new
                {
                    inputs = new {
                        question = question,
                        context = context
                    }
                };
                var jsonRequest = JsonConvert.SerializeObject(requestBody);
                var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");
                
                // Hugging Face API'sine istek gönder
                var httpResponse = await _httpClient.PostAsync(_apiEndpoint, content);
                
                if (httpResponse.IsSuccessStatusCode)
                {
                    var jsonResponse = await httpResponse.Content.ReadAsStringAsync();
                    dynamic responseData = JsonConvert.DeserializeObject(jsonResponse);
                    response.IsSuccess = true;
                    response.ResponseText = responseData.answer ?? string.Empty;
                }
                else
                {
                    var errorContent = await httpResponse.Content.ReadAsStringAsync();
                    _logger.LogError($"Hugging Face API Error: {httpResponse.StatusCode}, {errorContent}");
                    response.ErrorMessage = $"API Error: {httpResponse.StatusCode}, {errorContent}";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling Hugging Face API");
                response.ErrorMessage = $"Exception: {ex.Message}";
            }
            
            // İşlem süresini hesapla
            var endTime = DateTime.UtcNow;
            response.ProcessingTime = (endTime - startTime).TotalMilliseconds;
            response.Timestamp = endTime;
            
            return response;
        }

        public async Task<bool> LogInteractionAsync(int userId, AIChatRequest request, AIChatResponse response)
        {
            try
            {
                // AI etkileşimini logla
                var aiLog = new AIInteractionLog
                {
                    UserId = userId,
                    InputPrompt = request.Prompt,
                    AIResponse = response.ResponseText,
                    TokensUsed = response.TokensUsed,
                    ProcessingTime = (int)response.ProcessingTime,
                    CreatedAt = response.Timestamp,
                    ModelUsed = "deepseek-chat",
                    InteractionType = "text-prompt",
                    Cost = CalculateCost(response.TokensUsed) // Basit maliyet hesaplama
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
        
        // Basit bir maliyet hesaplama yöntemi (token başına maliyet)
        private decimal CalculateCost(int tokens)
        {
            // İstek başına maliyet (1000 token başına yaklaşık $0.002)
            return tokens * 0.000002m;
        }

        public async Task<string> AskQuestionAsync(string question)
        {
            var request = new AIChatRequest { Prompt = question };
            var response = await GetResponseAsync(request);
            return response?.ResponseText ?? string.Empty;
        }
    }
} 