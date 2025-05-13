using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace NoteWiz.API.Middleware
{
    public class AIRateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IMemoryCache _cache;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AIRateLimitingMiddleware> _logger;

        public AIRateLimitingMiddleware(
            RequestDelegate next,
            IMemoryCache cache,
            IConfiguration configuration,
            ILogger<AIRateLimitingMiddleware> logger)
        {
            _next = next;
            _cache = cache;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Sadece AI endpoint'lerini kontrol et
            if (!context.Request.Path.StartsWithSegments("/api/ai"))
            {
                await _next(context);
                return;
            }

            var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? context.User?.FindFirst("nameid")?.Value
                      ?? context.User?.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Unauthorized");
                return;
            }

            var cacheKey = $"ai_ratelimit_{userId}";
            var maxRequests = _configuration.GetValue<int>("AI:RateLimit:MaxRequests", 100);
            var timeWindow = _configuration.GetValue<int>("AI:RateLimit:TimeWindowMinutes", 60);

            if (!_cache.TryGetValue(cacheKey, out int requestCount))
            {
                var cacheEntryOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(timeWindow));
                _cache.Set(cacheKey, 1, cacheEntryOptions);
            }
            else if (requestCount >= maxRequests)
            {
                context.Response.StatusCode = 429;
                await context.Response.WriteAsync("Too many requests. Please try again later.");
                return;
            }
            else
            {
                _cache.Set(cacheKey, requestCount + 1);
            }

            await _next(context);
        }
    }
} 