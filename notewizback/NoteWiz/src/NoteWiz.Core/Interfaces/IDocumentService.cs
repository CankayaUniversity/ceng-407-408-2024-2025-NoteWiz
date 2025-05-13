using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    public interface IDocumentService
    {
        Task<Document> UploadDocumentAsync(byte[] fileData, string fileName);
        Task<IEnumerable<Document>> GetUserDocumentsAsync();
        Task<Document> GetDocumentWithNotesAsync(int documentId);
        Task<Document> UpdateDocumentAsync(int documentId, string title, string content, bool isPrivate, string tags, int? categoryId);
        Task DeleteDocumentAsync(int documentId);
    }
} 