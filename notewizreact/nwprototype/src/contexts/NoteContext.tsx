import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Note, noteService, CreateNoteDTO, UpdateNoteDTO, UpdateCoverDTO } from '../services/noteService';
import { useAuth } from './AuthContext';
import { folderService } from '../services/folderService';
import { apiClient } from '../services/newApi';

// Note tipini yeniden export et
export type { Note };

// Sadece FolderData interface'ini bırakıyoruz
export interface FolderData {
  title: string;
  parentFolderId: number | null;
  isFolder: boolean;
}

// Diğer interface'leri kaldırıyoruz (Note, CreateNoteDTO, UpdateNoteDTO)

// NoteContextData interface'ini güncelliyoruz
interface NoteContextData {
  notes: Note[];
  sharedNotes: Note[];
  loading: boolean;
  error: string | null;
  loadNotes: () => Promise<void>;
  loadSharedNotes: () => Promise<void>;
  createNote: (note: CreateNoteDTO) => Promise<Note>;
  updateNote: (id: number | string, note: UpdateNoteDTO) => Promise<Note>;
  deleteNote: (id: number | string) => Promise<void>;
  updateNoteCover: (id: number | string, coverData: UpdateCoverDTO) => Promise<Note>;
  shareNote: (id: number | string, userId: number | string, canEdit: boolean) => Promise<void>;
  clearError: () => void;
  addFolder: (folder: FolderData) => Promise<void>;
  moveNoteToFolder: (noteId: number | string, folderId: number | string | null) => Promise<void>;
  updateNoteSummary: (noteId: string, summary: string) => void;
}

const NoteContext = createContext<NoteContextData>({} as NoteContextData);

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
};

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [sharedNotes, setSharedNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/notes');
      console.log('API notes response:', res.data);
      if (Array.isArray(res.data)) {
        setNotes(res.data);
      } else if (Array.isArray(res.data.notes)) {
        setNotes(res.data.notes);
      } else {
        setNotes([]);
      }
    } catch (err) {
      setError('Failed to load notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSharedNotes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await noteService.getSharedNotes();
      setSharedNotes(response);
    } catch (err) {
      setError('Failed to load shared notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Authentication effect
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadNotes();
      loadSharedNotes();
    } else if (!isAuthenticated && !authLoading) {
      setNotes([]);
      setSharedNotes([]);
    }
  }, [isAuthenticated, authLoading, loadNotes, loadSharedNotes]);

  const createNote = useCallback(async (noteData: CreateNoteDTO) => {
    try {
      setLoading(true);
      const apiNoteData = {
        ...noteData,
        isPinned: noteData.isImportant,
      };
      const newNote = await noteService.createNote(apiNoteData);
      setNotes(prev => [
        ...prev,
        {
          ...newNote,
          id: newNote.id ? newNote.id : Date.now().toString(),
          isImportant: newNote.isPinned,
        }
      ]);
      return newNote;
    } catch (err) {
      setError('Failed to create note');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNote = useCallback(async (id: number | string, noteData: UpdateNoteDTO) => {
    try {
      setLoading(true);
      const apiNoteData = {
        ...noteData,
        isPinned: noteData.isImportant,
      };
      console.log('[updateNote] id:', id, 'type:', typeof id, 'noteData:', apiNoteData);
      if (id === undefined || id === null) {
        throw new Error('updateNote: id is undefined or null');
      }
      const updatedNote = await noteService.updateNote(id.toString(), apiNoteData);
      setNotes(prev => prev.map(note => 
        note.id === id 
          ? { ...updatedNote, isImportant: updatedNote.isPinned } 
          : note
      ));
      return updatedNote;
    } catch (err) {
      setError('Failed to update note');
      console.error('[updateNote] error:', err, 'full error object:', JSON.stringify(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteNote = useCallback(async (id: number | string) => {
    try {
      setLoading(true);
      await noteService.deleteNote(id.toString());
      setNotes(prev => prev.filter(note => note.id !== id.toString()));
    } catch (err) {
      setError('Failed to delete note');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNoteCover = useCallback(async (id: number | string, coverData: UpdateCoverDTO) => {
    try {
      setLoading(true);
      const updatedNote = await noteService.updateCover(id.toString(), coverData);
      setNotes(prev => prev.map(note => note.id === id.toString() ? updatedNote : note));
      return updatedNote;
    } catch (err) {
      setError('Failed to update note cover');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const shareNote = useCallback(async (id: number | string, userId: number | string, canEdit: boolean) => {
    try {
      setLoading(true);
      await noteService.shareNote(id.toString(), userId.toString(), canEdit);
    } catch (err) {
      setError('Failed to share note');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Folder operations
  const addFolder = useCallback(async (folder: FolderData) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const folderNote: CreateNoteDTO = {
        title: folder.title,
        content: "",
        tags: '',
        color: "#EFEFEF",
        isPinned: false,
        isFolder: true,
        folderId: folder.parentFolderId !== null && folder.parentFolderId !== undefined ? folder.parentFolderId.toString() : null
      };
      
      const createdFolder = await noteService.createNote(folderNote);
      setNotes(prev => [...prev, createdFolder]);
    } catch (err) {
      setError('Failed to create folder');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const moveNoteToFolder = useCallback(async (noteId: number | string, folderId: number | string | null) => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      // folderId'yi string olarak gönder
      const folderIdStr = folderId === null || folderId === undefined ? '0' : folderId.toString();
      await apiClient.patch(`/notes/${noteId}/move-to-folder`, folderIdStr, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (folderId) {
        await apiClient.post(`/folder/${folderId}/notes/${noteId}`);
      }
      setNotes(prev => prev.map(note => 
        note.id === noteId.toString() ? { ...note, folderId: folderId ? folderId.toString() : null } : note
      ));
    } catch (err) {
      setError('Failed to move note');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateNoteSummary = useCallback(async (noteId: string, summary: string) => {
    try {
      // Backend'e PATCH isteği gönder
      await apiClient.patch(`/notes/${noteId}/summary`, summary, {
        headers: { 'Content-Type': 'application/json' }
      });
      // Local state'i de güncelle
      setNotes(prev => prev.map(note => note.id === noteId ? { ...note, summary } : note));
    } catch (err) {
      console.error('Summary güncellenemedi:', err);
    }
  }, []);

  return (
    <NoteContext.Provider
      value={{
        notes,
        sharedNotes,
        loading,
        error,
        loadNotes,
        loadSharedNotes,
        createNote,
        updateNote,
        deleteNote,
        updateNoteCover,
        shareNote,
        clearError,
        addFolder,
        moveNoteToFolder,
        updateNoteSummary,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
}; 