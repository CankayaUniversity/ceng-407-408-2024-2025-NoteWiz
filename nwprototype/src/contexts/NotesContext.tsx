// src/contexts/NotesContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { notesService } from '../services/api';
import { useAuth } from './AuthContext';
import axios from 'axios';

// Note type definition
export interface Note {
  id: string; // Will be converted from number to string
  title: string;
  content: string;
  tags: string[];
  color: string;
  isImportant: boolean;
  isPdf?: boolean;
  pdfUrl?: string;
  pdfName?: string;
  coverImage?: any;
  isPinned: boolean; // API might be using this instead of isImportant
  userId: string;
  folderId: string | null;
  isFolder?: boolean;
  parentFolderId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  sharedWith?: any[];
  category?: string;
  drawings?: any[];
}

// For folder operations
export interface FolderData {
  title: string;
  parentFolderId: string | null;
  isFolder: boolean;
}

interface NotesContextType {
  notes: Note[];
  isLoading: boolean;
  addNote: (noteData: Partial<Note>) => Promise<string>;
  updateNote: (id: string, noteData: Partial<Note>) => Promise<boolean>;
  deleteNote: (id: string) => Promise<boolean>;
  addFolder: (folder: { title: string; parentFolderId: string | null; isFolder: boolean }) => Promise<void>;
  moveNoteToFolder: (noteId: string, folderId: string | null) => Promise<void>;
}

// Create context
const NotesContext = createContext<NotesContextType>({
  notes: [],
  isLoading: false,
  addNote: async () => "",
  updateNote: async () => false,
  deleteNote: async () => false,
  addFolder: async () => {},
  moveNoteToFolder: async () => {},
});

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Only fetch notes when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchNotes();
    } else if (!isAuthenticated && !authLoading) {
      // Clear notes when not authenticated
      setNotes([]);
    }
  }, [isAuthenticated, authLoading]);

  // Get notes from API
  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const data = await notesService.getNotes();
      
      // Process API data
      const formattedNotes = data.map((note: any) => ({
        ...note,
        id: note.id.toString(), // Convert Int to string
        userId: note.userId.toString(),
        folderId: note.folderId ? note.folderId.toString() : null,
        // Map between isImportant and isPinned
        isImportant: note.isPinned !== undefined ? note.isPinned : note.isImportant,
        // Convert date strings to Date objects
        createdAt: new Date(note.createdAt),
        updatedAt: note.updatedAt ? new Date(note.updatedAt) : undefined
      }));
      
      setNotes(formattedNotes);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data);
        // Kullanıcıya hata mesajı göster
      }
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new note
  const addNote = async (noteData: Partial<Note>): Promise<string> => {
    if (!isAuthenticated) return "";
    
    try {
      // Prepare data for API
      const apiNoteData = {
        title: noteData.title || "New Note",
        content: noteData.content || "",
        tags: noteData.tags || [],
        color: noteData.color || "#FFFFFF",
        // isImportant -> isPinned conversion
        isPinned: noteData.isImportant !== undefined ? noteData.isImportant : false,
        // Extra fields for PDF
        isPdf: noteData.isPdf || false,
        pdfUrl: noteData.pdfUrl || null,
        pdfName: noteData.pdfName || null,
        // Add folder ID if exists
        folderId: noteData.folderId || null
      };
      
      // Add note to API
      const createdNote = await notesService.createNote(apiNoteData);
      
      // Add new note to state
      const newNote: Note = {
        ...createdNote,
        id: createdNote.id.toString(),
        userId: createdNote.userId.toString(),
        folderId: createdNote.folderId ? createdNote.folderId.toString() : null,
        isImportant: createdNote.isPinned, // isPinned -> isImportant
        createdAt: new Date(createdNote.createdAt),
        updatedAt: new Date(createdNote.updatedAt),
        tags: createdNote.tags || []
      };
      
      setNotes(prevNotes => [...prevNotes, newNote]);
      return newNote.id;
    } catch (error) {
      console.error('Error adding note:', error);
      return "";
    }
  };

  // Update note
  const updateNote = async (id: string, noteData: Partial<Note>): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      // Prepare data for API
      const apiNoteData = {
        title: noteData.title,
        content: noteData.content,
        tags: noteData.tags,
        color: noteData.color,
        // isImportant -> isPinned conversion
        isPinned: noteData.isImportant
      };
      
      // Update note in API
      const updatedNote = await notesService.updateNote(parseInt(id), apiNoteData);
      
      // Update note in state
      setNotes(prevNotes => 
        prevNotes.map(note => {
          if (note.id === id) {
            return {
              ...note,
              ...noteData,
              title: updatedNote.title || note.title,
              content: updatedNote.content || note.content,
              tags: updatedNote.tags || note.tags,
              color: updatedNote.color || note.color,
              isImportant: updatedNote.isPinned !== undefined ? updatedNote.isPinned : note.isImportant,
              updatedAt: new Date(updatedNote.updatedAt)
            };
          }
          return note;
        })
      );
      
      return true;
    } catch (error) {
      console.error('Error updating note:', error);
      return false;
    }
  };

  // Delete note
  const deleteNote = async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      // Delete note from API
      await notesService.deleteNote(parseInt(id));
      
      // Remove note from state
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  };

  // Add folder (note: this endpoint might not exist in your API, createNote can be used alternatively)
  const addFolder = async (folder: { title: string; parentFolderId: string | null; isFolder: boolean }) => {
    if (!isAuthenticated) return;
    
    try {
      // Create note for folder
      const apiNoteData = {
        title: folder.title,
        content: "",
        tags: [],
        color: "#EFEFEF",
        isPinned: false,
        // Folder properties
        isFolder: true,
        folderId: folder.parentFolderId ? parseInt(folder.parentFolderId) : null
      };
      
      // Add to API as folder
      const createdFolder = await notesService.createNote(apiNoteData);
      
      // Add new folder to state
      const newFolder: Note = {
        ...createdFolder,
        id: createdFolder.id.toString(),
        userId: createdFolder.userId.toString(),
        folderId: createdFolder.folderId ? createdFolder.folderId.toString() : null,
        isImportant: false,
        isPinned: false,
        isFolder: true,
        parentFolderId: folder.parentFolderId,
        createdAt: new Date(createdFolder.createdAt),
        updatedAt: new Date(createdFolder.updatedAt),
        tags: []
      };
      
      setNotes(prevNotes => [...prevNotes, newFolder]);
    } catch (error) {
      console.error('Error adding folder:', error);
      
      // Fallback - if folder creation is not supported in API
      const tempFolder: Note = {
        id: `temp-folder-${Date.now()}`,
        title: folder.title,
        content: "",
        tags: [],
        color: "#EFEFEF",
        isImportant: false,
        isPinned: false,
        userId: "current-user",
        folderId: null,
        isFolder: true,
        parentFolderId: folder.parentFolderId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setNotes(prevNotes => [...prevNotes, tempFolder]);
    }
  };

  // Move note to folder (note: this endpoint might not exist in your API, updateNote can be used alternatively)
  const moveNoteToFolder = async (noteId: string, folderId: string | null) => {
    if (!isAuthenticated) return;
    
    try {
      // Prepare data for API
      const note = notes.find(n => n.id === noteId);
      if (!note) {
        throw new Error('Note not found');
      }
      
      // Handle folderId correctly
      const apiNoteData = {
        folderId: folderId ? parseInt(folderId) : null
      };
      
      // Update note in API
      await notesService.updateNote(parseInt(noteId), apiNoteData);
      
      // Update note in state
      setNotes(prevNotes => 
        prevNotes.map(n => 
          n.id === noteId 
            ? { ...n, folderId: folderId }
            : n
        )
      );
    } catch (error) {
      console.error('Error moving note:', error);
      
      // Try to update UI (even if API fails)
      setNotes(prevNotes => 
        prevNotes.map(n => 
          n.id === noteId 
            ? { ...n, folderId: folderId }
            : n
        )
      );
    }
  };
  
  // Provide context values
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

// Hook for easy usage
export const useNotes = () => useContext(NotesContext);