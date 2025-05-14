import React, { createContext, useContext, useState, useCallback } from 'react';
import { NoteShare, shareService, ShareNoteDTO } from '../services/shareService';

interface ShareContextData {
  sharedNotes: NoteShare[];
  loading: boolean;
  error: string | null;
  loadSharedNotes: () => Promise<void>;
  shareNote: (noteId: number, data: ShareNoteDTO) => Promise<NoteShare>;
  getNoteShares: (noteId: number) => Promise<NoteShare[]>;
  updateSharePermission: (shareId: number, canEdit: boolean) => Promise<NoteShare>;
  removeShare: (shareId: number) => Promise<void>;
  clearError: () => void;
}

const ShareContext = createContext<ShareContextData>({} as ShareContextData);

export const useShares = () => {
  const context = useContext(ShareContext);
  if (!context) {
    throw new Error('useShares must be used within a ShareProvider');
  }
  return context;
};

export const ShareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sharedNotes, setSharedNotes] = useState<NoteShare[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSharedNotes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await shareService.getSharedNotes();
      setSharedNotes(response);
    } catch (err) {
      setError('Failed to load shared notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const shareNote = useCallback(async (noteId: number, data: ShareNoteDTO) => {
    try {
      setLoading(true);
      const newShare = await shareService.shareNote(noteId.toString(), data);
      setSharedNotes(prev => [...prev, newShare]);
      return newShare;
    } catch (err) {
      setError('Failed to share note');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getNoteShares = useCallback(async (noteId: number) => {
    try {
      setLoading(true);
      const shares = await shareService.getNoteShares(noteId.toString());
      if (!Array.isArray(shares)) {
        console.error('getNoteShares: API response is not an array', shares);
        return [];
      }
      return shares;
    } catch (err) {
      setError('Failed to get note shares');
      console.error('getNoteShares error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSharePermission = useCallback(async (shareId: number, canEdit: boolean) => {
    try {
      setLoading(true);
      const updatedShare = await shareService.updateSharePermission(shareId.toString(), canEdit);
      setSharedNotes(prev => prev.map(share => 
        share.id === shareId.toString() ? updatedShare : share
      ));
      return updatedShare;
    } catch (err) {
      setError('Failed to update share permission');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeShare = useCallback(async (shareId: number) => {
    try {
      setLoading(true);
      await shareService.removeShare(shareId.toString());
      setSharedNotes(prev => prev.filter(share => share.id !== shareId.toString()));
    } catch (err) {
      setError('Failed to remove share');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ShareContext.Provider
      value={{
        sharedNotes,
        loading,
        error,
        loadSharedNotes,
        shareNote,
        getNoteShares,
        updateSharePermission,
        removeShare,
        clearError,
      }}
    >
      {children}
    </ShareContext.Provider>
  );
}; 