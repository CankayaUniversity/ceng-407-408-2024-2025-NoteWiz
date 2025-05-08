using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteWiz.Core.Entities;
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
        public async Task<IActionResult> UploadDocument([FromForm] IFormFile file)
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
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Döküman yükleme hatası");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Döküman yükleme sırasında bir hata oluştu");
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
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Döküman bulunamadı" });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Döküman getirilirken bir hata oluştu");
                return StatusCode(500, new { message = "Döküman getirilirken bir hata oluştu" });
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
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Döküman bulunamadı" });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Döküman silinirken bir hata oluştu");
                return StatusCode(500, new { message = "Döküman silinirken bir hata oluştu" });
            }
        }
    }
} 