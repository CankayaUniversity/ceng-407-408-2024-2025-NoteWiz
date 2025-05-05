using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace NoteWiz.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AiController : ControllerBase
    {
        private readonly IOpenAiService _openAiService;

        public AiController(IOpenAiService openAiService)
        {
            _openAiService = openAiService;
        }

        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] AiPromptDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Prompt))
                return BadRequest("Prompt is required.");

            var result = await _openAiService.AskAsync(dto.Prompt);
            return Ok(new { response = result });
        }
    }

    // DTO
    public class AiPromptDto
    {
        public string Prompt { get; set; }
    }
}