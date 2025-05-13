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
  sharedWith?: any[];
  drawings?: any[];
  isPdf?: boolean;
  pdfUrl?: string;
  pdfName?: string;
  coverImage?: any;
}

export interface CreateNoteDTO {
  title: string;
  content: string;
  tags?: string[];
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
  category?: string;
}

export interface UpdateNoteDTO extends Partial<CreateNoteDTO> {}

export interface UpdateCoverDTO {
  coverType?: string;
  coverPosition?: string;
  color?: string;
}

class NoteService {
  async getNotes(): Promise<Note[]> {
    const response = await apiClient.get('/Notes');
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
    const response = await apiClient.put(`/Notes/${id}`, note);
    return this.transformApiNote(response.data);
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
    return response.data.map(this.transformApiNote);
  }

  async shareNote(id: string, userId: string, canEdit: boolean): Promise<void> {
    await apiClient.post(`/Notes/${id}/share`, { sharedWithUserId: userId, canEdit });
  }

  private transformApiNote(apiNote: any): Note {
    return {
      ...apiNote,
      id: apiNote.id.toString(),
      userId: apiNote.userId.toString(),
      folderId: apiNote.folderId?.toString() || null,
      parentFolderId: apiNote.parentFolderId?.toString() || null,
      isImportant: apiNote.isPinned,
      isPinned: apiNote.isPinned,
    };
  }
}

export const noteService = new NoteService(); 