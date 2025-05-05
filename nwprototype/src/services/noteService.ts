import { apiClient as api } from './api';

export interface Note {
  id: number | string;
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
  userId: number | string;
  folderId: number | string | null;
  isFolder?: boolean;
  parentFolderId?: number | string | null;
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
  folderId?: number | string | null;
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
    const response = await api.get('/notes');
    return response.data.map(this.transformApiNote);
  }

  async getNote(id: number | string): Promise<Note> {
    const response = await api.get(`/notes/${id}`);
    return this.transformApiNote(response.data);
  }

  async createNote(note: CreateNoteDTO): Promise<Note> {
    const noteData = {
      ...note,
      folderId: note.folderId || null
    };
    const response = await api.post('/notes', noteData);
    return this.transformApiNote(response.data);
  }

  async updateNote(id: number | string, note: UpdateNoteDTO): Promise<Note> {
    const response = await api.put(`/notes/${id}`, note);
    return this.transformApiNote(response.data);
  }

  async deleteNote(id: number | string): Promise<void> {
    await api.delete(`/notes/${id}`);
  }

  async updateCover(id: number | string, coverData: UpdateCoverDTO): Promise<Note> {
    const response = await api.put(`/notes/${id}/cover`, coverData);
    return this.transformApiNote(response.data);
  }

  async getSharedNotes(): Promise<Note[]> {
    const response = await api.get('/notes/shared');
    return response.data.map(this.transformApiNote);
  }

  async shareNote(id: number | string, userId: number | string, canEdit: boolean): Promise<void> {
    await api.post(`/notes/${id}/share`, { sharedWithUserId: userId, canEdit });
  }

  private transformApiNote(apiNote: any): Note {
    return {
      ...apiNote,
      isImportant: apiNote.isPinned,
      isPinned: apiNote.isPinned,
    };
  }
}

export const noteService = new NoteService(); 