// src/contexts/NotesContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import firestore, { 
  FirebaseFirestoreTypes 
} from '@react-native-firebase/firestore';
import { useAuth } from './AuthContext';

export interface Point {
  x: number;
  y: number;
  timestamp: number;
}

export interface DrawPath {
  points: Point[];
  color: string;
  width: number;
  opacity: number;
  tool: 'pen' | 'eraser' | 'highlighter';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isImportant: boolean;
  category: string;
  drawings?: DrawPath[];
  isPdf?: boolean;
  pdfUrl?: string;
  pdfName?: string;
}

interface NotesContextType {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  isLoading: boolean;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    // Firestore'dan notları dinle
    const unsubscribe = firestore()
    .collection('notes')
    .where('userId', '==', user.id)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        try {
          const newNotes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          })) as Note[];
          setNotes(newNotes);
          setIsLoading(false);
        } catch (error) {
          console.error('Error processing notes:', error);
          setNotes([]);
          setIsLoading(false);
        }
      },
      (error: Error) => {
        console.error('Notes listening error:', error);
        setNotes([]);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addNote = async (note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      await firestore().collection('notes').add({
        ...note,
        userId: user.id,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding note:', error);
      throw new Error('Not eklenirken bir hata oluştu.');
    }
  };

  const updateNote = async (id: string, noteUpdate: Partial<Note>) => {
    try {
      await firestore()
        .collection('notes')
        .doc(id)
        .update({
          ...noteUpdate,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error updating note:', error);
      throw new Error('Not güncellenirken bir hata oluştu.');
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await firestore()
        .collection('notes')
        .doc(id)
        .delete();
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new Error('Not silinirken bir hata oluştu.');
    }
  };

  return (
    <NotesContext.Provider 
      value={{ 
        notes, 
        addNote, 
        updateNote, 
        deleteNote,
        isLoading
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};