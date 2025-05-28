using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    public interface IDocumentRepository : IRepository<Document>
    {
        Task<IEnumerable<Document>> GetUserDocumentsAsync(int userId);
        Task<Document> GetDocumentWithNotesAsync(int documentId);
    }
} 