using System.Collections.Generic;
using System.Threading.Tasks;
using NoteWiz.Core.DTOs;

namespace NoteWiz.Core.Interfaces
{
    public interface INoteShareService
    {
        Task<NoteShareResponseDTO> ShareNoteAsync(CreateNoteShareDTO dto);
        Task<IEnumerable<NoteShareResponseDTO>> GetSharedNotesAsync(int userId);
        Task<IEnumerable<NoteShareResponseDTO>> GetNotesSharedByMeAsync(int userId);
        Task<NoteShareResponseDTO> GetSharedNoteByTokenAsync(string token);
        Task RemoveShareAsync(int noteShareId);
    }
} 