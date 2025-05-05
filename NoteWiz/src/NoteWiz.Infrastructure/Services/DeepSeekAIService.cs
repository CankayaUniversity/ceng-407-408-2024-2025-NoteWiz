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
            
            // API yapılandırmasını yükle
            _apiKey = _configuration["AI:DeepSeek:ApiKey"];
            _apiEndpoint = _configuration["AI:DeepSeek:Endpoint"] ?? "https://api.deepseek.com/v1/chat/completions";
            
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
                // DeepSeek için mesaj formatını hazırla
                var messages = new List<object>();
                
                // Önceki mesajları ekle
                foreach (var prevMessage in request.PreviousMessages)
                {
                    messages.Add(new
                    {
                        role = prevMessage.Role,
                        content = prevMessage.Content
                    });
                }
                
                // Kullanıcı mesajını ekle
                messages.Add(new
                {
                    role = "user",
                    content = request.Prompt
                });
                
                // API isteği için JSON oluştur
                var requestBody = new
                {
                    model = "deepseek-chat",
                    messages,
                    max_tokens = request.MaxTokens,
                    temperature = request.Temperature
                };
                
                var jsonRequest = JsonConvert.SerializeObject(requestBody);
                var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");
                
                // DeepSeek API'sine istek gönder
                var httpResponse = await _httpClient.PostAsync(_apiEndpoint, content);
                
                if (httpResponse.IsSuccessStatusCode)
                {
                    var jsonResponse = await httpResponse.Content.ReadAsStringAsync();
                    dynamic responseData = JsonConvert.DeserializeObject(jsonResponse);
                    
                    response.IsSuccess = true;
                    response.ResponseText = responseData.choices[0].message.content;
                    response.TokensUsed = responseData.usage.total_tokens;
                }
                else
                {
                    var errorContent = await httpResponse.Content.ReadAsStringAsync();
                    _logger.LogError($"DeepSeek API Error: {httpResponse.StatusCode}, {errorContent}");
                    response.ErrorMessage = $"API Error: {httpResponse.StatusCode}, {errorContent}";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calling DeepSeek API");
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
    }
} 