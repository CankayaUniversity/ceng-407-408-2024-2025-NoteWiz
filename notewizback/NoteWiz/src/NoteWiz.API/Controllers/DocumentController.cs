using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;
using System.Security.Claims;

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
                // Token kontrolü
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    _logger.LogError("Token'da kullanıcı ID bulunamadı");
                    return Unauthorized(new { message = "Geçersiz token" });
                }

                _logger.LogInformation("PDF yükleme isteği alındı. Dosya adı: {FileName}, Boyut: {FileSize}, Kullanıcı ID: {UserId}", 
                    file?.FileName, file?.Length, userIdClaim.Value);

                if (file == null || file.Length == 0)
                {
                    _logger.LogWarning("Boş dosya gönderildi");
                    return BadRequest(new { message = "Dosya boş olamaz" });
                }

                using (var memoryStream = new MemoryStream())
                {
                    await file.CopyToAsync(memoryStream);
                    _logger.LogInformation("Dosya memory stream'e kopyalandı");

                    var document = await _documentService.UploadDocumentAsync(memoryStream.ToArray(), file.FileName);
                    _logger.LogInformation("Document servisi çağrıldı ve döküman oluşturuldu: {@Document}", document);

                    if (document == null)
                    {
                        _logger.LogError("Document servisi null döndü");
                        return StatusCode(500, new { message = "Döküman oluşturulamadı" });
                    }

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