using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;
using NoteWiz.Core.Interfaces;

namespace NoteWiz.Application.Services
{
    public class DocumentUploadService : IDocumentUploadService
    {
        private readonly IUnitOfWork _unitOfWork;

        public DocumentUploadService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<DocumentUpload> GetDocumentByIdAsync(int id)
        {
            return await _unitOfWork.DocumentUploads.GetByIdAsync(id);
        }

        public async Task<IEnumerable<DocumentUpload>> GetUserDocumentsAsync(int userId)
        {
            return await _unitOfWork.DocumentUploads.GetUserDocumentsAsync(userId);
        }

        public async Task<DocumentUpload> UploadDocumentAsync(DocumentUpload document)
        {
            await _unitOfWork.DocumentUploads.AddAsync(document);
            await _unitOfWork.SaveChangesAsync();
            return document;
        }

        public async Task DeleteDocumentAsync(int id)
        {
            var document = await _unitOfWork.DocumentUploads.GetByIdAsync(id);
            if (document != null)
            {
                _unitOfWork.DocumentUploads.Remove(document);
                await _unitOfWork.SaveChangesAsync();
            }
        }
    }
} 