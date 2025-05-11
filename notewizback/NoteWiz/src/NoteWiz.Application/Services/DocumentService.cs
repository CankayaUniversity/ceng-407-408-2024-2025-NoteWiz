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
                return int.Parse(userIdClaim.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kullanıcı ID alınırken hata oluştu");
                throw;
            }
        }

        public async Task<Document> UploadDocumentAsync(byte[] fileData, string fileName)
        {
            try
            {
                var userId = GetCurrentUserId();
                var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
                var filePath = Path.Combine(_uploadPath, uniqueFileName);

                await File.WriteAllBytesAsync(filePath, fileData);
                _logger.LogInformation("Dosya başarıyla kaydedildi: {FilePath}", filePath);

                var document = new Document
                {
                    Title = Path.GetFileNameWithoutExtension(fileName),
                    FileName = uniqueFileName,
                    FilePath = filePath,
                    FileSize = fileData.Length,
                    CreatedAt = DateTime.UtcNow,
                    UserId = userId,
                    IsPrivate = true, // Default olarak private
                    Content = "", // Boş içerik ile başla
                    Tags = "" // Boş etiketler ile başla
                };

                _logger.LogInformation("Document entity oluşturuldu: {@Document}", document);

                await _documentRepository.AddAsync(document);
                _logger.LogInformation("Document repository'e eklendi");

                await _unitOfWork.SaveChangesAsync();
                _logger.LogInformation("Değişiklikler kaydedildi. Document ID: {DocumentId}", document.Id);

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

        public async Task<Document> UpdateDocumentAsync(int documentId, string title, string content, bool isPrivate, string tags, int? categoryId)
        {
            var document = await _documentRepository.GetByIdAsync(documentId);
            if (document == null)
            {
                throw new KeyNotFoundException("Döküman bulunamadı");
            }

            if (document.UserId != GetCurrentUserId())
            {
                throw new UnauthorizedAccessException("Bu dökümanı düzenleme izniniz yok");
            }

            document.Title = title;
            document.Content = content;
            document.IsPrivate = isPrivate;
            document.Tags = tags;
            document.CategoryId = categoryId;
            document.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.SaveChangesAsync();
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