import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Note, noteService, CreateNoteDTO, UpdateNoteDTO, UpdateCoverDTO } from '../services/noteService';
import { useAuth } from './AuthContext';

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
      const response = await noteService.getNotes();
      setNotes(response);
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
      setNotes(prev => [...prev, {
        ...newNote,
        isImportant: newNote.isPinned,
      }]);
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
      await noteService.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
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
      const updatedNote = await noteService.updateCover(id, coverData);
      setNotes(prev => prev.map(note => note.id === id ? updatedNote : note));
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
      await noteService.shareNote(id, userId, canEdit);
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
        tags: [],
        color: "#EFEFEF",
        isPinned: false,
        isFolder: true,
        folderId: folder.parentFolderId
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
      const noteData: UpdateNoteDTO = {
        folderId: folderId
      };
      
      const updatedNote = await noteService.updateNote(noteId, noteData);
      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, folderId } : note
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
      }}
    >
      {children}
    </NoteContext.Provider>
  );
}; 