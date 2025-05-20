import { apiClient } from './newApi';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  isPinned: boolean;
  isImportant: boolean;
  coverType?: string;
  coverPosition?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  folderId: string | null;
  isFolder?: boolean;
  parentFolderId?: string | null;
  category?: string;
  categoryId?: number;
  sharedWith?: any[];
  drawings?: any[];
  isPdf?: boolean;
  pdfUrl?: string;
  pdfName?: string;
  coverImage?: any;
  icon?: string;
  name?: string;
  summary?: string;
}

export interface CreateNoteDTO {
  title: string;
  content: string;
  tags?: string;
  color?: string;
  isPinned?: boolean;
  isImportant?: boolean;
  coverType?: string;
  coverPosition?: string;
  isPdf?: boolean;
  pdfUrl?: string;
  pdfName?: string;
  isFolder?: boolean;
  folderId?: string | null;
  categoryId?: number;
}

export interface UpdateNoteDTO extends Partial<CreateNoteDTO> {
  isPrivate?: boolean;
  coverImage?: string;
}

export interface UpdateCoverDTO {
  coverType?: string;
  coverPosition?: string;
  color?: string;
}

export interface User {
  id: number;
  username: string;
  token?: string;
}

class NoteService {
  async getNotes(): Promise<Note[]> {
    const response = await apiClient.get('/Notes');
    if (!Array.isArray(response.data)) {
      console.error('API response is not an array:', response.data);
      return [];
    }
    return response.data.map(this.transformApiNote);
  }

  async getFolderNotes(folderId: number): Promise<Note[]> {
    const response = await apiClient.get(`/folder/${folderId}/notes`);
    return response.data.map(this.transformApiNote);
  }

  async getNote(id: string): Promise<Note> {
    const response = await apiClient.get(`/Notes/${id}`);
    return this.transformApiNote(response.data);
  }

  async createNote(note: CreateNoteDTO): Promise<Note> {
    const noteData = {
      ...note,
      folderId: note.folderId || null
    };
    const response = await apiClient.post('/Notes', noteData);
    return this.transformApiNote(response.data);
  }

  async updateNote(id: string, note: UpdateNoteDTO): Promise<Note> {
    console.log('[noteService.updateNote] Starting update with id:', id, 'note:', note);
    try {
      // Send all note fields to the API
      const noteData = {
        title: note.title,
        content: note.content || '',
        color: note.color,
        isPinned: note.isPinned,
        isPrivate: note.isPrivate || false,
        coverImage: note.coverImage,
        folderId: note.folderId,
        tags: note.tags,
        categoryId: note.categoryId
      };
      console.log('[noteService.updateNote] Sending to API:', noteData);
      const response = await apiClient.put(`/Notes/${id}`, noteData);
      console.log('[noteService.updateNote] API response:', response.data);
      if (!response.data) {
        throw new Error('API response is empty!');
      }
      return this.transformApiNote(response.data);
    } catch (error) {
      console.error('[noteService.updateNote] Error:', error);
      throw error;
    }
  }

  async deleteNote(id: string): Promise<void> {
    await apiClient.delete(`/Notes/${id}`);
  }

  async updateCover(id: string, coverData: UpdateCoverDTO): Promise<Note> {
    const response = await apiClient.put(`/Notes/${id}/cover`, coverData);
    return this.transformApiNote(response.data);
  }

  async getSharedNotes(): Promise<Note[]> {
    const response = await apiClient.get('/Notes/shared');
    return Array.isArray(response.data) ? response.data.map(this.transformApiNote) : [];
  }

  async shareNote(id: string, userId: string, canEdit: boolean): Promise<void> {
    await apiClient.post(`/Notes/${id}/share`, { sharedWithUserId: userId, canEdit });
  }

  private transformApiNote(apiNote: any): Note {
    return {
      ...apiNote,
      id: apiNote.id ? apiNote.id.toString() : '',
      userId: apiNote.userId ? apiNote.userId.toString() : '',
      folderId: apiNote.folderId ? apiNote.folderId.toString() : null,
      parentFolderId: apiNote.parentFolderId ? apiNote.parentFolderId.toString() : null,
      isImportant: apiNote.isPinned,
      isPinned: apiNote.isPinned,
      isFolder: typeof apiNote.isFolder === 'boolean' ? apiNote.isFolder : false,
      categoryId: apiNote.categoryId
    };
  }
}

export const noteService = new NoteService(); 