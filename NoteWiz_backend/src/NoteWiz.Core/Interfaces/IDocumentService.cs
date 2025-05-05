using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    public interface IDocumentService
    {
        Task<DocumentUpload> CreateDocumentAsync(DocumentUpload document);
        Task<DocumentUpload> GetDocumentAsync(int id, int userId);
        Task<IEnumerable<DocumentUpload>> GetUserDocumentsAsync(int userId);
        Task<bool> DeleteDocumentAsync(int id, int userId);
        Task<string> ExtractTextAsync(string filePath);
    }
} 