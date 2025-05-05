using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.Entities;

namespace NoteWiz.Core.Interfaces
{
    public interface IDocumentUploadRepository : IGenericRepository<DocumentUpload>
    {
        Task<IEnumerable<DocumentUpload>> GetUserDocumentsAsync(int userId);
    }
} 