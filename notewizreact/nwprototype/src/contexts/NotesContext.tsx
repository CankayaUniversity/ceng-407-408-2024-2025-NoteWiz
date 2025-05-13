// src/contexts/NotesContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
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
      const apiNoteData = {
        title: noteData.title || '',
        content: noteData.content || '',
        tags: noteData.tags || [],
        color: noteData.color || '#FFFFFF',
        isPinned: noteData.isImportant || false
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
      if (!note) return;

      originalFolderId = note.folderId;

      // Update the note's folderId in the local state
      setNotes(prevNotes =>
        prevNotes.map(n => n.id === noteId ? { ...n, folderId } : n)
      );

      // Update the note's content in the API
      await notesService.updateNote(noteId, {
        title: note.title,
        content: note.content
      });
    } catch (error) {
      console.error('Error moving note to folder:', error);
      // Revert the local state if the API call fails
      setNotes(prevNotes =>
        prevNotes.map(n => n.id === noteId ? { ...n, folderId: originalFolderId } : n)
      );
    }
  };

  const contextValue = {
    notes,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
    addFolder,
    moveNoteToFolder
  };

  return (
    <NotesContext.Provider value={contextValue}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => useContext(NotesContext);