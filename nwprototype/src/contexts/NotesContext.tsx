// src/contexts/NotesContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useAuth } from './AuthContext';

// Define Note type
export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  isImportant: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  // PDF properties
  isPdf?: boolean;
  pdfUrl?: string;
  pdfName?: string;
  // Folder properties
  isFolder?: boolean;
  folderId?: string | null;
  parentFolderId?: string | null;
  // Cover image
  coverImage?: any; // This would be the source of the image
  coverImagePath?: string; // Path to the image in storage
}

// Input types for adding/updating notes
type NoteInput = Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;
type FolderInput = {
  title: string;
  isFolder: true;
  parentFolderId: string | null;
};

// Context interface
interface NotesContextType {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  addNote: (noteData: NoteInput) => Promise<string>;
  updateNote: (id: string, noteData: Partial<NoteInput>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addFolder: (folderData: FolderInput) => Promise<string>;
  moveNoteToFolder: (noteId: string, folderId: string | null) => Promise<void>;
  updateNoteCover: (noteId: string, coverImage: any, generateAI?: boolean) => Promise<void>;
}

// Create the context
const NotesContext = createContext<NotesContextType | undefined>(undefined);

// Create provider component
export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch notes from Firestore
  useEffect(() => {
    if (!user) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection('notes')
      .where('userId', '==', user.id)
      .onSnapshot(
        (snapshot) => {
          const notesData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            } as Note;
          });
          setNotes(notesData);
          setIsLoading(false);
        },
        (err) => {
          console.error('Error fetching notes:', err);
          setError('Failed to fetch notes');
          setIsLoading(false);
        }
      );

    return () => unsubscribe();
  }, [user]);

  // Add a new note
  const addNote = async (noteData: NoteInput): Promise<string> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const newNote = {
        ...noteData,
        userId: user.id,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      // If it's a PDF, handle PDF upload
      if (noteData.isPdf && noteData.pdfUrl && !noteData.pdfUrl.startsWith('https://')) {
        const pdfFileName = `pdfs/${user.id}/${Date.now()}_${noteData.pdfName || 'document.pdf'}`;
        const reference = storage().ref(pdfFileName);
        
        // Upload PDF
        await reference.putFile(noteData.pdfUrl);
        
        // Get download URL
        const downloadUrl = await reference.getDownloadURL();
        newNote.pdfUrl = downloadUrl;
      }

      const docRef = await firestore().collection('notes').add(newNote);
      return docRef.id;
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Failed to add note');
      throw err;
    }
  };

  // Update an existing note
  const updateNote = async (id: string, noteData: Partial<NoteInput>): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const updateData = {
        ...noteData,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      // If it's a PDF and there's a new PDF file to upload
      if (noteData.isPdf && noteData.pdfUrl && !noteData.pdfUrl.startsWith('https://')) {
        const pdfFileName = `pdfs/${user.id}/${Date.now()}_${noteData.pdfName || 'document.pdf'}`;
        const reference = storage().ref(pdfFileName);
        
        // Upload PDF
        await reference.putFile(noteData.pdfUrl);
        
        // Get download URL
        const downloadUrl = await reference.getDownloadURL();
        updateData.pdfUrl = downloadUrl;
      }

      await firestore().collection('notes').doc(id).update(updateData);
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note');
      throw err;
    }
  };

  // Delete a note
  const deleteNote = async (id: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const note = notes.find(n => n.id === id);
      
      // If it's a PDF, delete the file from storage
      if (note?.isPdf && note.pdfUrl) {
        try {
          const storageRef = storage().refFromURL(note.pdfUrl);
          await storageRef.delete();
        } catch (storageErr) {
          console.error('Error deleting PDF file:', storageErr);
          // Continue with note deletion even if file deletion fails
        }
      }
      
      // If it's a folder, delete all notes in the folder
      if (note?.isFolder) {
        const notesInFolder = notes.filter(n => n.folderId === id);
        const deletePromises = notesInFolder.map(noteInFolder => 
          deleteNote(noteInFolder.id)
        );
        await Promise.all(deletePromises);
      }
      
      // If there's a cover image, delete it from storage
      if (note?.coverImagePath) {
        try {
          const coverRef = storage().ref(note.coverImagePath);
          await coverRef.delete();
        } catch (coverErr) {
          console.error('Error deleting cover image:', coverErr);
          // Continue with note deletion even if cover deletion fails
        }
      }
      
      await firestore().collection('notes').doc(id).delete();
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note');
      throw err;
    }
  };

  // Add a new folder
  const addFolder = async (folderData: FolderInput): Promise<string> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const newFolder = {
        ...folderData,
        userId: user.id,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        content: '', // Folders don't have content
        category: 'folder', // Using a special category for folders
        isImportant: false,
      };

      const docRef = await firestore().collection('notes').add(newFolder);
      return docRef.id;
    } catch (err) {
      console.error('Error adding folder:', err);
      setError('Failed to add folder');
      throw err;
    }
  };

  // Move a note to a folder
  const moveNoteToFolder = async (noteId: string, folderId: string | null): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      await firestore().collection('notes').doc(noteId).update({
        folderId,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.error('Error moving note to folder:', err);
      setError('Failed to move note');
      throw err;
    }
  };

  // Update note cover
  const updateNoteCover = async (
    noteId: string, 
    coverImage: any, 
    generateAI: boolean = false
  ): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const note = notes.find(n => n.id === noteId);
      let coverImagePath = note?.coverImagePath;
      let newCoverUrl = null;
      
      // If there's an existing cover and we're changing it, delete the old one
      if (note?.coverImagePath && coverImage) {
        try {
          const oldCoverRef = storage().ref(note.coverImagePath);
          await oldCoverRef.delete();
        } catch (coverErr) {
          console.error('Error deleting old cover image:', coverErr);
        }
      }
      
      // If we're setting a new cover
      if (coverImage) {
        if (generateAI) {
          // In a real app, this would call an AI service
          // For now, we'll just use the provided image
          console.log('AI cover generation would happen here');
        }
        
        // Upload the cover image
        const coverFileName = `covers/${user.id}/${Date.now()}_cover.jpg`;
        const coverRef = storage().ref(coverFileName);
        
        // In a real app, you would convert the image to a file and upload it
        // For demo purposes, we'll just simulate a successful upload
        // await coverRef.putFile(coverImageUri);
        // newCoverUrl = await coverRef.getDownloadURL();
        
        coverImagePath = coverFileName;
        newCoverUrl = coverImage; // In a real app, this would be the download URL
      }
      
      await firestore().collection('notes').doc(noteId).update({
        coverImagePath,
        coverImage: newCoverUrl,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.error('Error updating note cover:', err);
      setError('Failed to update note cover');
      throw err;
    }
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        isLoading,
        error,
        addNote,
        updateNote,
        deleteNote,
        addFolder,
        moveNoteToFolder,
        updateNoteCover,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

// Custom hook to use the notes context
export const useNotes = (): NotesContextType => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};