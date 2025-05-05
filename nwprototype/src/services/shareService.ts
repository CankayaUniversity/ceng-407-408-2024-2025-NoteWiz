import { apiClient } from './api';

export interface NoteShare {
  id: number;
  noteId: number;
  sharedWithUserId: number;
  canEdit: boolean;
  sharedAt: string;
  sharedWithUser: {
    id: number;
    username: string;
    email: string;
    fullName: string;
  };
}

export interface ShareNoteDTO {
  sharedWithUserId: number;
  canEdit: boolean;
}

class ShareService {
  async shareNote(noteId: number, data: ShareNoteDTO): Promise<NoteShare> {
    const response = await apiClient.post(`/notes/${noteId}/share`, data);
    return response.data;
  }

  async getSharedNotes(): Promise<NoteShare[]> {
    const response = await apiClient.get('/notes/shared');
    return response.data;
  }

  async getNoteShares(noteId: number): Promise<NoteShare[]> {
    const response = await apiClient.get(`/notes/${noteId}/shares`);
    return response.data;
  }

  async updateSharePermission(shareId: number, canEdit: boolean): Promise<NoteShare> {
    const response = await apiClient.put(`/notes/shares/${shareId}`, { canEdit });
    return response.data;
  }

  async removeShare(shareId: number): Promise<void> {
    await apiClient.delete(`/notes/shares/${shareId}`);
  }
}

export const shareService = new ShareService(); 