using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    public interface IDocumentUploadService
    {
        Task<DocumentUpload> GetDocumentByIdAsync(int id);
        Task<IEnumerable<DocumentUpload>> GetUserDocumentsAsync(int userId);
        Task<DocumentUpload> UploadDocumentAsync(DocumentUpload document);
        Task DeleteDocumentAsync(int id);
    }
} 