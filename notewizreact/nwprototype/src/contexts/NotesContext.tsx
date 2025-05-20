// src/contexts/NotesContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notesService } from '../services/newApi';
import { useAuth } from './AuthContext';

// Note type definition
export interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  color: string;
  isImportant: boolean;
  isPdf?: boolean;
  pdfUrl?: string;
  pdfName?: string;
  coverImage?: string;
  isPinned: boolean;
  userId: number;
  folderId: number | null;
  isFolder?: boolean;
  parentFolderId?: number | null;
  createdAt: string;
  updatedAt: string;
  sharedWith?: any[];
  category?: string;
  drawings?: any[];
  isPrivate: boolean;
}

// For folder operations
export interface FolderData {
  title: string;
  parentFolderId: number | null;
  isFolder: boolean;
}

interface NotesContextType {
  notes: Note[];
  isLoading: boolean;
  addNote: (noteData: Partial<Note>) => Promise<number>;
  updateNote: (id: number, noteData: Partial<Note>) => Promise<boolean>;
  deleteNote: (id: number) => Promise<boolean>;
  addFolder: (folder: FolderData) => Promise<void>;
  moveNoteToFolder: (noteId: number, folderId: number | null) => Promise<void>;
  loadNotes: () => Promise<void>;
  loadFolderNotes: (folderId: number) => Promise<void>;
}

// Create context
const NotesContext = createContext<NotesContextType>({
  notes: [],
  isLoading: false,
  addNote: async () => 0,
  updateNote: async () => false,
  deleteNote: async () => false,
  addFolder: async () => {},
  moveNoteToFolder: async () => {},
  loadNotes: async () => {},
  loadFolderNotes: async () => {},
});

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchNotes();
    } else if (!isAuthenticated && !authLoading) {
      setNotes([]);
    }
  }, [isAuthenticated, authLoading]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const data = await notesService.getNotes();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async (noteData: Partial<Note>): Promise<number> => {
    if (!isAuthenticated) return 0;
    
    try {
      const apiNoteData = {
        title: noteData.title || "New Note",
        content: noteData.content || "",
        tags: noteData.tags || [],
        color: noteData.color || "#FFFFFF",
        isPinned: noteData.isImportant || false,
        isPdf: noteData.isPdf || false,
        pdfUrl: noteData.pdfUrl || null,
        pdfName: noteData.pdfName || null,
        folderId: noteData.folderId || null
      };
      
      const createdNote = await notesService.createNote(apiNoteData);
      setNotes(prevNotes => [...prevNotes, createdNote]);
      return createdNote.id;
    } catch (error) {
      console.error('Error adding note:', error);
      return 0;
    }
  };

  const updateNote = async (id: number, noteData: Partial<Note>): Promise<boolean> => {
    if (!isAuthenticated) return false;
    try {
      // Mevcut notu bul
      const currentNote = notes.find(n => n.id === id);
      const apiNoteData: {
        title: string;
        content: string;
        color?: string;
        isPinned: boolean;
        folderId: number | null;
        tags: string[];
        isPrivate: boolean;
      } = {
        title: noteData.title || currentNote?.title || 'Untitled Note',
        content: noteData.content || currentNote?.content || '',
        color: noteData.color || currentNote?.color || '#FFFFFF',
        isPinned: noteData.isImportant ?? currentNote?.isPinned ?? false,
        folderId: noteData.folderId ?? currentNote?.folderId ?? null,
        tags: noteData.tags || currentNote?.tags || [],
        isPrivate: noteData.isPrivate ?? currentNote?.isPrivate ?? true
      };
      const updatedNote = await notesService.updateNote(id, apiNoteData);
      setNotes(prevNotes => 
        prevNotes.map(note => note.id === id ? updatedNote : note)
      );
      return true;
    } catch (error) {
      console.error('Error updating note:', error);
      return false;
    }
  };

  const deleteNote = async (id: number): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      await notesService.deleteNote(id);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  };

  const addFolder = async (folder: FolderData) => {
    if (!isAuthenticated) return;
    
    try {
      const apiNoteData = {
        title: folder.title,
        content: "",
        tags: [],
        color: "#EFEFEF",
        isPinned: false,
        isFolder: true,
        folderId: folder.parentFolderId
      };
      
      const createdFolder = await notesService.createNote(apiNoteData);
      setNotes(prevNotes => [...prevNotes, createdFolder]);
    } catch (error) {
      console.error('Error adding folder:', error);
    }
  };

  const moveNoteToFolder = async (noteId: number, folderId: number | null) => {
    if (!isAuthenticated) return;
    
    let originalFolderId: number | null = null;
    
    try {
      const note = notes.find(n => n.id === noteId);
      if (!note) {
        console.error('Note not found');
        return;
      }

      originalFolderId = note.folderId;

      // Update the note's folderId in the local state
      setNotes(prevNotes =>
        prevNotes.map(n => n.id === noteId ? { ...n, folderId } : n)
      );

      // Update the note in the API with all required fields
      await notesService.updateNote(noteId, {
        title: note.title || "Untitled Note",
        content: note.content || "",
        color: note.color || "#FFFFFF",
        isPinned: note.isPinned ?? false,
        folderId: folderId,
        tags: Array.isArray(note.tags) ? note.tags : [],
        isPrivate: note.isPrivate ?? true
      });
    } catch (error) {
      console.error('Error moving note to folder:', error);
      // Revert the local state if the API call fails
      setNotes(prevNotes =>
        prevNotes.map(n => n.id === noteId ? { ...n, folderId: originalFolderId } : n)
      );
    }
  };

  const loadNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const [notes, folders] = await Promise.all([
        notesService.getNotes(),
        notesService.getFolders()
      ]);
      console.log('Çekilen notlar:', notes);
      console.log('Çekilen klasörler:', folders);
      setNotes([...notes, ...folders]);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFolderNotes = useCallback(async (folderId: number) => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const folderNotes = await notesService.getFolderNotes(folderId);
      setNotes(folderNotes);
    } catch (error) {
      console.error('Error loading folder notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const contextValue = {
    notes,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
    addFolder,
    moveNoteToFolder,
    loadNotes,
    loadFolderNotes
  };

  return (
    <NotesContext.Provider value={contextValue}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => useContext(NotesContext);