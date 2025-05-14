import { apiClient } from './newApi';

export interface NoteShare {
  id: string;
  noteId: string;
  sharedWithUserId: string;
  canEdit: boolean;
  sharedAt: string;
  sharedWithUser: {
    id: string;
    username: string;
    email: string;
    fullName: string;
  };
}

export interface ShareNoteDTO {
  sharedWithUserId?: string;
  canEdit: boolean;
  sharedWithEmail?: string;
}

class ShareService {
  async shareNote(noteId: string, data: ShareNoteDTO): Promise<NoteShare> {
    const response = await apiClient.post(`/Notes/${noteId}/share`, data);
    return this.transformApiShare(response.data);
  }

  async getSharedNotes(): Promise<NoteShare[]> {
    const response = await apiClient.get('/Notes/shared');
    return response.data.map(this.transformApiShare);
  }

  async getNoteShares(noteId: string): Promise<NoteShare[]> {
    const response = await apiClient.get(`/NoteShares/my-notes/${noteId}`);
    if (!Array.isArray(response.data)) {
      console.error('API getNoteShares: response.data is not array', response.data);
      return [];
    }
    return response.data.map(this.transformApiShare);
  }

  async updateSharePermission(shareId: string, canEdit: boolean): Promise<NoteShare> {
    const response = await apiClient.put(`/Notes/shares/${shareId}`, { canEdit });
    return this.transformApiShare(response.data);
  }

  async removeShare(shareId: string): Promise<void> {
    await apiClient.delete(`/Notes/shares/${shareId}`);
  }

  private transformApiShare(apiShare: any): NoteShare {
    return {
      ...apiShare,
      id: apiShare.id ? apiShare.id.toString() : '',
      noteId: apiShare.noteId ? apiShare.noteId.toString() : '',
      sharedWithUserId: apiShare.sharedWithUserId ? apiShare.sharedWithUserId.toString() : '',
      sharedWithUser: apiShare.sharedWithUser
        ? {
            ...apiShare.sharedWithUser,
            id: apiShare.sharedWithUser.id ? apiShare.sharedWithUser.id.toString() : '',
          }
        : {
            id: '',
            username: '',
            email: '',
            fullName: '',
          },
    };
  }
}

export const shareService = new ShareService(); 