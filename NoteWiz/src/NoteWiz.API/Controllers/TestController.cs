using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace NoteWiz.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly ILogger<TestController> _logger;

        public TestController(ILogger<TestController> logger)
        {
            _logger = logger;
        }

        [HttpGet("headers")]
        public IActionResult GetHeaders()
        {
            var headers = Request.Headers.ToDictionary(h => h.Key, h => h.Value.ToString());
            
            // Log all headers
            foreach (var header in headers)
            {
                _logger.LogInformation("Header: {Key} = {Value}", header.Key, header.Value);
            }

            // Check Authorization header specifically
            if (Request.Headers.TryGetValue("Authorization", out var authHeader))
            {
                _logger.LogInformation("Authorization header found: {Value}", authHeader.ToString());
            }
            else
            {
                _logger.LogWarning("Authorization header not found");
            }

            return Ok(headers);
        }

        [Authorize]
        [HttpGet("auth")]
        public IActionResult GetAuth()
        {
            // Log user information
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            _logger.LogInformation("Authenticated user - ID: {UserId}, Email: {Email}, Username: {Username}", 
                userId, email, username);

            return Ok(new { 
                message = "Authenticated successfully",
                userId,
                email,
                username
            });
        }
    }
} 