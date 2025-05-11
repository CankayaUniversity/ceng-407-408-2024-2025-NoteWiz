using System;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Application.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly IDocumentRepository _documentRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<DocumentService> _logger;
        private readonly string _uploadPath;

        public DocumentService(
            IDocumentRepository documentRepository,
            IUnitOfWork unitOfWork,
            IHttpContextAccessor httpContextAccessor,
            ILogger<DocumentService> logger)
        {
            _documentRepository = documentRepository;
            _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Documents");
            
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        private int GetCurrentUserId()
        {
            try
            {
                var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    _logger.LogError("Kullanıcı ID bulunamadı. HttpContext veya User null olabilir.");
                    throw new UnauthorizedAccessException("Kullanıcı kimliği bulunamadı");
                }

                var userId = int.Parse(userIdClaim.Value);
                _logger.LogInformation("Kullanıcı ID başarıyla alındı: {UserId}", userId);
                return userId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı ID alınırken hata oluştu");
                throw new UnauthorizedAccessException("Kullanıcı kimliği alınamadı", ex);
            }
        }

        public async Task<Document> UploadDocumentAsync(byte[] fileData, string fileName)
        {
            try
            {
                _logger.LogInformation("PDF yükleme başladı: {FileName}", fileName);

                if (fileData == null || fileData.Length == 0)
                {
                    throw new ArgumentException("Dosya boş olamaz");
                }

                if (Path.GetExtension(fileName).ToLower() != ".pdf")
                {
                    throw new ArgumentException("Sadece PDF dosyaları yüklenebilir");
                }

                var userId = GetCurrentUserId();
                if (userId <= 0)
                {
                    throw new UnauthorizedAccessException("Geçersiz kullanıcı ID");
                }

                _logger.LogInformation("Kullanıcı ID: {UserId}", userId);

                var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
                var filePath = Path.Combine(_uploadPath, uniqueFileName);

                await File.WriteAllBytesAsync(filePath, fileData);
                _logger.LogInformation("PDF dosyası kaydedildi: {FilePath}", filePath);

                var document = new Document
                {
                    Title = Path.GetFileNameWithoutExtension(fileName),
                    FileName = uniqueFileName,
                    FilePath = filePath,
                    FileSize = fileData.Length,
                    CreatedAt = DateTime.UtcNow,
                    UserId = userId
                };

                _logger.LogInformation("Document entity oluşturuldu: {@Document}", document);

                await _documentRepository.AddAsync(document);
                _logger.LogInformation("Document repository'e eklendi");

                await _unitOfWork.SaveChangesAsync();
                _logger.LogInformation("Değişiklikler kaydedildi. Document ID: {DocumentId}", document.Id);

                // PDF yüklendiğinde otomatik olarak ilişkili bir Note oluştur
                var note = new Note
                {
                    Title = document.Title,
                    Content = "",
                    IsPrivate = true,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    DocumentId = document.Id
                };

                _logger.LogInformation("Note entity oluşturuldu: {@Note}", note);

                await _unitOfWork.Notes.AddAsync(note);
                _logger.LogInformation("Note repository'e eklendi");

                await _unitOfWork.SaveChangesAsync();
                _logger.LogInformation("Note değişiklikleri kaydedildi. Note ID: {NoteId}", note.Id);

                return document;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "PDF yükleme sırasında hata oluştu: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<IEnumerable<Document>> GetUserDocumentsAsync()
        {
            var userId = GetCurrentUserId();
            return await _documentRepository.GetUserDocumentsAsync(userId);
        }

        public async Task<Document> GetDocumentWithNotesAsync(int documentId)
        {
            var document = await _documentRepository.GetDocumentWithNotesAsync(documentId);
            if (document == null)
            {
                throw new KeyNotFoundException("Döküman bulunamadı");
            }

            if (document.UserId != GetCurrentUserId())
            {
                throw new UnauthorizedAccessException("Bu dökümana erişim izniniz yok");
            }

            return document;
        }

        public async Task DeleteDocumentAsync(int documentId)
        {
            var document = await _documentRepository.GetByIdAsync(documentId);
            if (document == null)
            {
                throw new KeyNotFoundException("Döküman bulunamadı");
            }

            if (document.UserId != GetCurrentUserId())
            {
                throw new UnauthorizedAccessException("Bu dökümanı silme izniniz yok");
            }

            if (File.Exists(document.FilePath))
            {
                File.Delete(document.FilePath);
            }

            await _documentRepository.DeleteAsync(document);
            await _unitOfWork.SaveChangesAsync();
        }
    }
} 