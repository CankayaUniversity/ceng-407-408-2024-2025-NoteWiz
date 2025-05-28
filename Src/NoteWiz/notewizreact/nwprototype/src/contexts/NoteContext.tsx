import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Note, noteService, CreateNoteDTO, UpdateNoteDTO, UpdateCoverDTO } from '../services/noteService';
import { useAuth } from './AuthContext';
import { folderService } from '../services/folderService';
import { apiClient } from '../services/newApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { drawingService } from '../services/drawingService';

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
  addCategory: (name: string, color: string) => Promise<Note>;
}

const NoteContext = createContext<NoteContextData>({} as NoteContextData);

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
};

// Cache ve pending yardımcı fonksiyonları
const cacheNotes = async (notes: Note[]) => {
  await AsyncStorage.setItem('cachedNotes', JSON.stringify(notes));
};
const getCachedNotes = async (): Promise<Note[]> => {
  const cached = await AsyncStorage.getItem('cachedNotes');
  return cached ? JSON.parse(cached) : [];
};
const getPendingNotes = async (): Promise<Note[]> => {
  const pending = await AsyncStorage.getItem('pendingNotes');
  return pending ? JSON.parse(pending) : [];
};
const setPendingNotes = async (pendingNotes: Note[]) => {
  await AsyncStorage.setItem('pendingNotes', JSON.stringify(pendingNotes));
};

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [sharedNotes, setSharedNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isOffline, setIsOffline] = useState(false);

  // NetInfo ile online/offline durumu takip et
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Notları yükle (online ise API'den, offline ise cache'den)
  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      let notesData: Note[] = [];
      if (isOffline) {
        notesData = await getCachedNotes();
      } else {
        const res = await apiClient.get('/notes');
        notesData = Array.isArray(res.data) ? res.data : [];
        await cacheNotes(notesData);
        // --- Çizimleri de cache'e yaz ---
        for (const note of notesData) {
          try {
            const drawings = await drawingService.getDrawings(note.id);
            if (drawings.length > 0) {
              // Son çizimi cache'e yaz (drawingService zaten cacheDrawings çağırıyor)
              // Burada ekstra bir şey yapmaya gerek yok, sadece getDrawings çağırmak yeterli
            }
          } catch (e) {
            // Çizim yoksa veya hata varsa geç
          }
        }
      }
      setNotes(notesData);
    } catch (err) {
      setError('Failed to load notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isOffline]);

  // Pending notları API'ye gönder (online olunca)
  const syncPendingNotes = useCallback(async () => {
    if (isOffline) return;
    const pendingNotes = await getPendingNotes();
    if (!pendingNotes.length) return;
    const synced: Note[] = [];
    // Çizim id eşleştirme için localId-backendId haritası
    const idMap: { [localId: string]: string } = {};
    
    for (const note of pendingNotes) {
      try {
        // Note objesini CreateNoteDTO'ya dönüştür
        const createDto = {
          title: note.title,
          content: note.content,
          tags: Array.isArray(note.tags) ? note.tags.join(',') : note.tags,
          color: note.color,
          isPinned: note.isPinned,
          isImportant: note.isImportant,
          coverType: note.coverType,
          coverPosition: note.coverPosition,
          isPdf: note.isPdf,
          pdfUrl: note.pdfUrl,
          pdfName: note.pdfName,
          isFolder: note.isFolder,
          folderId: note.folderId,
          categoryId: note.categoryId,
        };
        console.log('[SYNC] Pending not gönderiliyor:', { localId: note.id, createDto });
        const created = await noteService.createNote(createDto);
        console.log('[SYNC] Backend not oluşturuldu:', { localId: note.id, backendId: created.id });
        
        // Her zaman idMap'e ekle, çünkü localId ile backendId farklı olacak
        idMap[note.id] = created.id;
        synced.push(note);
      } catch (e) {
        console.log('[SYNC] Not gönderilemedi:', note, e);
      }
    }

    // Başarılı olanları pending listesinden çıkar
    const newPending = pendingNotes.filter(n => !synced.find(s => s.id === n.id));
    await setPendingNotes(newPending);

    // Pending çizimlerin noteId'lerini güncelle
    if (Object.keys(idMap).length > 0) {
      const pendingDrawingsRaw = await AsyncStorage.getItem('pendingDrawings');
      let pendingDrawings = pendingDrawingsRaw ? JSON.parse(pendingDrawingsRaw) : [];
      let changed = false;
      
      pendingDrawings = pendingDrawings.map((d: any) => {
        if (idMap[d.noteId]) {
          console.log('[SYNC] Çizim noteId güncellendi:', { 
            oldNoteId: d.noteId, 
            newNoteId: idMap[d.noteId] 
          });
          changed = true;
          return { ...d, noteId: idMap[d.noteId] };
        }
        return d;
      });

      if (changed) {
        await AsyncStorage.setItem('pendingDrawings', JSON.stringify(pendingDrawings));
      }
    }

    // Sync sonrası notları tekrar yükle ve cache'i güncelle
    await loadNotes();
    // Not id eşleşmeleri ve pendingDrawings güncellendikten sonra çizimleri sync et
    await drawingService.syncPendingDrawings();
  }, [isOffline, loadNotes]);

  // Not oluşturma (offline ise pending'e ekle)
  const createNote = useCallback(async (noteData: CreateNoteDTO) => {
    try {
      setLoading(true);
      const apiNoteData = {
        ...noteData,
        isPinned: noteData.isImportant,
      };
      let newNote: Note;
      if (isOffline) {
        // Local id ver
        newNote = {
          ...apiNoteData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isImportant: !!apiNoteData.isPinned,
          isPinned: !!apiNoteData.isPinned,
          tags: Array.isArray(apiNoteData.tags) ? apiNoteData.tags : (apiNoteData.tags ? apiNoteData.tags.split(',').map((t: string) => t.trim()) : []),
          userId: 'offline', // offline notlar için dummy userId
        } as Note;
        // Cache ve pending'e ekle
        const notes = await getCachedNotes();
        notes.push(newNote);
        await cacheNotes(notes);
        const pending = await getPendingNotes();
        // Duplicate kontrolü
        if (!pending.find(n => n.id === newNote.id)) {
          pending.push(newNote);
          await setPendingNotes(pending);
        }
        setNotes(notes);
      } else {
        newNote = await noteService.createNote(apiNoteData);
        const notes = await getCachedNotes();
        notes.push(newNote);
        await cacheNotes(notes);
        setNotes(notes);
      }
      return newNote;
    } catch (err) {
      setError('Failed to create note');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isOffline]);

  // Not güncelleme (offline ise pending'e ekle)
  const updateNote = useCallback(async (id: number | string, noteData: UpdateNoteDTO) => {
    try {
      setLoading(true);
      const apiNoteData = {
        ...noteData,
        isPinned: noteData.isImportant,
      };
      let updatedNote: Note;
      if (isOffline) {
        // Cache ve pending'de güncelle
        const notes = await getCachedNotes();
        const idx = notes.findIndex(n => n.id === id.toString());
        if (idx !== -1) {
          notes[idx] = {
            ...notes[idx],
            ...apiNoteData,
            updatedAt: new Date().toISOString(),
            tags: Array.isArray(apiNoteData.tags) ? apiNoteData.tags : (apiNoteData.tags ? apiNoteData.tags.split(',').map((t: string) => t.trim()) : []),
            isPinned: !!apiNoteData.isPinned,
          };
          await cacheNotes(notes);
          setNotes(notes);
        }
        // Pending'de güncelle veya ekle
        const pending = await getPendingNotes();
        const pidx = pending.findIndex(n => n.id === id.toString());
        if (pidx !== -1) {
          pending[pidx] = {
            ...pending[pidx],
            ...apiNoteData,
            updatedAt: new Date().toISOString(),
            tags: Array.isArray(apiNoteData.tags) ? apiNoteData.tags : (apiNoteData.tags ? apiNoteData.tags.split(',').map((t: string) => t.trim()) : []),
            isPinned: !!apiNoteData.isPinned,
          };
        } else if (idx !== -1) {
          pending.push({
            ...notes[idx],
            ...apiNoteData,
            updatedAt: new Date().toISOString(),
            tags: Array.isArray(apiNoteData.tags) ? apiNoteData.tags : (apiNoteData.tags ? apiNoteData.tags.split(',').map((t: string) => t.trim()) : []),
            isPinned: !!apiNoteData.isPinned,
          });
        }
        await setPendingNotes(pending);
        updatedNote = notes[idx];
      } else {
        updatedNote = await noteService.updateNote(id.toString(), apiNoteData);
        const notes = await getCachedNotes();
        const idx = notes.findIndex(n => n.id === id.toString());
        if (idx !== -1) {
          notes[idx] = updatedNote;
          await cacheNotes(notes);
          setNotes(notes);
        }
      }
      return updatedNote;
    } catch (err) {
      setError('Failed to update note');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isOffline]);

  // Not silme (offline ise cache ve pending'den çıkar)
  const deleteNote = useCallback(async (id: number | string) => {
    try {
      setLoading(true);
      if (isOffline) {
        let notes = await getCachedNotes();
        notes = notes.filter(n => n.id !== id.toString());
        await cacheNotes(notes);
        setNotes(notes);
        let pending = await getPendingNotes();
        pending = pending.filter(n => n.id !== id.toString());
        await setPendingNotes(pending);
      } else {
        await noteService.deleteNote(id.toString());
        let notes = await getCachedNotes();
        notes = notes.filter(n => n.id !== id.toString());
        await cacheNotes(notes);
        setNotes(notes);
      }
    } catch (err) {
      setError('Failed to delete note');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isOffline]);

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

  const addCategory = useCallback(async (name: string, color: string): Promise<Note> => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }
    
    try {
      setLoading(true);
      const categoryNote: CreateNoteDTO = {
        title: name,
        content: "",
        tags: '',
        color: color,
        isPinned: false,
        isFolder: true,
        folderId: null
      };
      
      let createdFolder: Note;
      if (isOffline) {
        // Offline modda local ID ile oluştur
        createdFolder = {
          ...categoryNote,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'offline',
          tags: [], // Boş array olarak başlat
          isImportant: false,
          isPinned: false,
          isPdf: false,
          pdfUrl: '',
          pdfName: '',
          isFolder: true,
          folderId: null,
          categoryId: undefined // null yerine undefined kullan
        } as Note;
        // Cache ve pending'e ekle
        const notes = await getCachedNotes();
        notes.push(createdFolder);
        await cacheNotes(notes);
        const pending = await getPendingNotes();
        pending.push(createdFolder);
        await setPendingNotes(pending);
        setNotes(notes);
      } else {
        createdFolder = await noteService.createNote(categoryNote);
        const notes = await getCachedNotes();
        notes.push(createdFolder);
        await cacheNotes(notes);
        setNotes(notes);
      }
      return createdFolder;
    } catch (err) {
      setError('Failed to create folder');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isOffline]);

  // window.syncPendingNotes ataması (App.tsx'den tetiklenebilmesi için)
  React.useEffect(() => {
    (globalThis as any).syncPendingNotes = syncPendingNotes;
    return () => { (globalThis as any).syncPendingNotes = undefined; };
  }, [syncPendingNotes]);

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
        addCategory,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};

// TypeScript'e window.syncPendingNotes özelliğini tanıt
declare global {
  interface Window {
    syncPendingNotes?: () => Promise<void>;
  }
} 