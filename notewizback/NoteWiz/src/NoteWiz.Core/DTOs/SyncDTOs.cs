using System;
using System.Collections.Generic;
using NoteWiz.Core.DTOs;

namespace NoteWiz.Core.DTOs
{
    public class SyncRequestDTO
    {
        public string DeviceId { get; set; }
        public List<NoteDTO> Notes { get; set; }
        public DateTime LastSyncTimestamp { get; set; }
    }

    public class SyncResponseDTO
    {
        public List<NoteDTO> ServerNotes { get; set; }
        public List<NoteDTO> Conflicts { get; set; }
        public DateTime SyncTimestamp { get; set; }
    }

    public class ConflictResolutionDTO
    {
        public NoteDTO ServerNote { get; set; }
        public NoteDTO ClientNote { get; set; }
        public bool UseServerVersion { get; set; }
    }
} 