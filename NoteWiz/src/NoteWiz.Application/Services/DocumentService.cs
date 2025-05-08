using System;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Application.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly IDocumentRepository _documentRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly string _uploadPath;

        public DocumentService(
            IDocumentRepository documentRepository,
            IUnitOfWork unitOfWork,
            IHttpContextAccessor httpContextAccessor)
        {
            _documentRepository = documentRepository;
            _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContextAccessor;
            _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Documents");
            
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }

        public async Task<Document> UploadDocumentAsync(byte[] fileData, string fileName)
        {
            if (fileData == null || fileData.Length == 0)
            {
                throw new ArgumentException("Dosya boş olamaz");
            }

            if (Path.GetExtension(fileName).ToLower() != ".pdf")
            {
                throw new ArgumentException("Sadece PDF dosyaları yüklenebilir");
            }

            var userId = GetCurrentUserId();
            var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
            var filePath = Path.Combine(_uploadPath, uniqueFileName);

            await File.WriteAllBytesAsync(filePath, fileData);

            var document = new Document
            {
                Title = Path.GetFileNameWithoutExtension(fileName),
                FileName = uniqueFileName,
                FilePath = filePath,
                FileSize = fileData.Length,
                CreatedAt = DateTime.UtcNow,
                UserId = userId
            };

            await _documentRepository.AddAsync(document);
            await _unitOfWork.SaveChangesAsync();

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
            await _unitOfWork.Notes.AddAsync(note);
            await _unitOfWork.SaveChangesAsync();

            return document;
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