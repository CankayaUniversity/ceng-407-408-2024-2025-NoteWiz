using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using NoteWiz.Application.Services;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentController : ControllerBase
    {
        private readonly IDocumentService _documentService;
        private readonly ILogger<DocumentController> _logger;

        public DocumentController(IDocumentService documentService, ILogger<DocumentController> logger)
        {
            _documentService = documentService;
            _logger = logger;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadDocument(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "Dosya boş olamaz" });
                }

                using (var memoryStream = new MemoryStream())
                {
                    await file.CopyToAsync(memoryStream);
                    var document = await _documentService.UploadDocumentAsync(memoryStream.ToArray(), file.FileName);
                    return Ok(new { message = "Döküman başarıyla yüklendi", document });
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Yetkilendirme hatası: {Message}", ex.Message);
                return Unauthorized(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Döküman yükleme hatası: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Döküman yükleme sırasında bir hata oluştu: {Message}", ex.Message);
                return StatusCode(500, new { message = "Döküman yüklenirken bir hata oluştu" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetUserDocuments()
        {
            try
            {
                var documents = await _documentService.GetUserDocumentsAsync();
                return Ok(documents);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Dökümanlar getirilirken bir hata oluştu");
                return StatusCode(500, new { message = "Dökümanlar getirilirken bir hata oluştu" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDocument(int id)
        {
            try
            {
                var document = await _documentService.GetDocumentWithNotesAsync(id);
                return Ok(document);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Döküman getirilirken bir hata oluştu");
                return StatusCode(500, new { message = "Döküman getirilirken bir hata oluştu" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDocument(int id, [FromBody] UpdateDocumentRequest request)
        {
            try
            {
                var document = await _documentService.UpdateDocumentAsync(
                    id,
                    request.Title,
                    request.Content,
                    request.IsPrivate,
                    request.Tags,
                    request.CategoryId
                );
                return Ok(document);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Döküman güncellenirken bir hata oluştu");
                return StatusCode(500, new { message = "Döküman güncellenirken bir hata oluştu" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            try
            {
                await _documentService.DeleteDocumentAsync(id);
                return Ok(new { message = "Döküman başarıyla silindi" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Döküman silinirken bir hata oluştu");
                return StatusCode(500, new { message = "Döküman silinirken bir hata oluştu" });
            }
        }
    }

    public class UpdateDocumentRequest
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public bool IsPrivate { get; set; }
        public string Tags { get; set; }
        public int? CategoryId { get; set; }
    }
} 