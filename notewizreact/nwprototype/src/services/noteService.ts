import { apiClient } from './newApi';
import { offlineStorage } from './offlineStorage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Note {
  id: string;
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
  userId: string;
  folderId: string | null;
  isFolder?: boolean;
  parentFolderId?: string | null;
  category?: string;
  sharedWith?: any[];
  drawings?: any[];
  isPdf?: boolean;
  pdfUrl?: string;
  pdfName?: string;
  coverImage?: any;
  isOffline?: boolean;
  syncStatus?: string;
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
  folderId?: string | null;
  category?: string;
  coverImage?: any;
}

export interface UpdateNoteDTO extends Partial<CreateNoteDTO> {
  isPrivate?: boolean;
  coverImage?: string;
}

export interface UpdateCoverDTO {
  coverType?: string;
  coverPosition?: string;
  color?: string;
}

export interface User {
  id: number;
  username: string;
  token?: string;
}

let isSyncing = false;

class NoteService {
  async getNotes(): Promise<Note[]> {
  const isConnected = await NetInfo.fetch().then((state: NetInfoState) => state.isConnected);
    if (isConnected) {
      const response = await apiClient.get('/Notes');
      // Locali güncelle
      await offlineStorage.saveNotes(response.data);
      return response.data.map(this.transformApiNote);
    } else {
      // Offline: localden oku
      const localNotes = await offlineStorage.getNotes();
      return localNotes;
    }
  } 

  async getNote(id: string): Promise<Note> {
    const response = await apiClient.get(`/Notes/${id}`);
    return this.transformApiNote(response.data);
  }

  async createNote(note: CreateNoteDTO): Promise<Note> {
    const isConnected = await NetInfo.fetch().then((state: NetInfoState) => state.isConnected);
    
    if (isConnected) {
      try {
        const noteData = { ...note, folderId: note.folderId || null };
        const response = await apiClient.post('/Notes', noteData);
        const createdNote = this.transformApiNote(response.data);
    
        // --- CACHE'E DE EKLE ---
        const notes = await offlineStorage.getNotes();
        notes.push(createdNote);
        await offlineStorage.saveNotes(notes);
        // -----------------------
    
        return createdNote;
      } catch (error) {
        console.error('API error:', error);
        throw error;
      }
    } else {
      // Offline modda not oluştur
      const notes = await offlineStorage.getNotes();
      const newNote: Note = {
        ...note,
        id: Date.now().toString(), // Geçici ID
        isOffline: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: '', // Sadece localde boş string olarak tut
        folderId: note.folderId || null,
        parentFolderId: null,
        isPinned: note.isPinned ?? false,
        isImportant: note.isImportant ?? false,
        color: note.color ?? '',
        title: note.title,
        content: note.content,
        tags: note.tags ?? [],
        syncStatus: 'pending',
        sharedWith: [],
        drawings: [],
        isPdf: note.isPdf ?? false,
        pdfUrl: note.pdfUrl ?? '',
        pdfName: note.pdfName ?? '',
        coverImage: note.coverImage ?? null,
      };
      notes.push(newNote);
      await offlineStorage.saveNotes(notes);
      await offlineStorage.savePendingSync('create', newNote);
      return newNote;
    }
  }

  async updateNote(id: string, note: UpdateNoteDTO): Promise<Note | undefined> {
    const isConnected = await NetInfo.fetch().then((state: NetInfoState) => state.isConnected);
    
    if (isConnected) {
      try {
        console.log('[noteService.updateNote] Starting update with id:', id, 'note:', note);
        // Only send the fields that the backend expects
        const noteData = {
          title: note.title,
          content: note.content,
          isPrivate: note.isPrivate || false,
          coverImage: note.coverImage
        };
        console.log('[noteService.updateNote] Sending to API:', noteData);
        const response = await apiClient.put(`/Notes/${id}`, noteData);
        console.log('[noteService.updateNote] API response:', response.data);
        if (!response.data) {
          throw new Error('API response is empty!');
        }
        return this.transformApiNote(response.data);
      } catch (error) {
        console.error('[noteService.updateNote] Error:', error);
        throw error;
      }
    } else {
      // Offline modda not güncelle
      const notes = await offlineStorage.getNotes();
      const noteIndex = notes.findIndex((n: Note) => n.id === id);
      if (noteIndex !== -1) {
        notes[noteIndex] = {
          ...notes[noteIndex],
          ...note,
          updatedAt: new Date().toISOString(),
          syncStatus: 'pending'
        };
        await offlineStorage.saveNotes(notes);
        await offlineStorage.savePendingSync('update', notes[noteIndex]);
        return notes[noteIndex];
      }
      return undefined;
    }
  }

  async deleteNote(id: string): Promise<void> {
    const isConnected = await NetInfo.fetch().then((state: NetInfoState) => state.isConnected);
    
    if (isConnected) {
      try {
        await apiClient.delete(`/Notes/${id}`);
      } catch (error) {
        console.error('API error:', error);
        throw error;
      }
    } else {
      // Offline modda not sil
      const notes = await offlineStorage.getNotes();
      const noteIndex = notes.findIndex((n: Note) => n.id === id);
      if (noteIndex !== -1) {
        const deletedNote = notes[noteIndex];
        notes.splice(noteIndex, 1);
        await offlineStorage.saveNotes(notes);
        await offlineStorage.savePendingSync('delete', deletedNote);
      }
    }
  }

  async updateCover(id: string, coverData: UpdateCoverDTO): Promise<Note> {
    const response = await apiClient.put(`/Notes/${id}/cover`, coverData);
    return this.transformApiNote(response.data);
  }

  async getSharedNotes(): Promise<Note[]> {
    const response = await apiClient.get('/Notes/shared');
    return response.data.map(this.transformApiNote);
  }

  async shareNote(id: string, userId: string, canEdit: boolean): Promise<void> {
    await apiClient.post(`/Notes/${id}/share`, { sharedWithUserId: userId, canEdit });
  }

  async syncOfflineData(onSyncUpdate: (notes: Note[]) => void = () => {}): Promise<void> {
    if (isSyncing) {
      console.log('[SYNC][SKIP] Zaten bir sync işlemi devam ediyor.');
      return;
    }
    isSyncing = true;
    try {
      const isConnected = await NetInfo.fetch().then((state: NetInfoState) => state.isConnected);
      if (!isConnected) {
        isSyncing = false;
        return;
      }
      let pendingActions = await offlineStorage.getPendingSync();
      console.log('[SYNC][PENDING][START]', JSON.stringify(pendingActions));
      // Aynı ID'li create ve drawing_create action'ları filtrele
      const seenCreateIds = new Set();
      const seenDrawingCreateIds = new Set();
      pendingActions = pendingActions.filter((action: any) => {
        if (action.action === 'create') {
          if (seenCreateIds.has(action.data.id)) {
            return false;
          }
          seenCreateIds.add(action.data.id);
        }
        if (action.action === 'drawing_create') {
          if (seenDrawingCreateIds.has(action.data.id)) {
            return false;
          }
          seenDrawingCreateIds.add(action.data.id);
        }
        return true;
      });
      let notes = await offlineStorage.getNotes();
      let updatedPending: any[] = [];
      const tempIdToRealId: Record<string, string> = {};
      let notesToRemove: string[] = [];
      const processedCreateIds: Set<string> = new Set();
      const processedActions: Set<string> = new Set();

      for (const action of pendingActions) {
        const actionKey = `${action.action}_${action.data?.id}`;
        if (processedActions.has(actionKey)) {
          console.log('[SYNC][SKIP] Zaten işlendi:', actionKey);
          continue;
        }
        console.log('[SYNC][PROCESS] İşleniyor:', actionKey);
        processedActions.add(actionKey);
        try {
          console.log('[SYNC] İşlem:', action.action, 'Data:', action.data);
          switch (action.action) {
            case 'create': {
              if (processedCreateIds.has(action.data.id)) {
                break;
              }
              processedCreateIds.add(action.data.id);
              const response = await apiClient.post('/Notes', action.data);
              const createdNote = response.data;
              const noteIndex = notes.findIndex((n: Note) => n.id === action.data.id);
              if (noteIndex !== -1) {
                const oldId = notes[noteIndex].id;
                notes[noteIndex] = {
                  ...notes[noteIndex],
                  id: createdNote.id.toString(),
                  syncStatus: 'synced',
                  isOffline: false,
                  ...createdNote
                };
                if (notes[noteIndex].drawings) {
                  notes[noteIndex].drawings = notes[noteIndex].drawings.map((drawing: any) => ({
                    ...drawing,
                    noteId: createdNote.id.toString()
                  }));
                }
                tempIdToRealId[oldId] = createdNote.id.toString();
                notesToRemove.push(oldId);
              }
              break;
            }
            case 'update': {
              let updateId = action.data.id;
              if (tempIdToRealId[updateId]) {
                updateId = tempIdToRealId[updateId];
              }
              await apiClient.put(`/Notes/${updateId}`, action.data);
              const noteIndex = notes.findIndex((n: Note) => n.id === updateId);
              if (noteIndex !== -1) {
                notes[noteIndex].syncStatus = 'synced';
              }
              break;
            }
            case 'delete': {
              let deleteId = action.data.id;
              if (tempIdToRealId[deleteId]) {
                deleteId = tempIdToRealId[deleteId];
              }
              await apiClient.delete(`/Notes/${deleteId}`);
              notes = notes.filter((n: Note) => n.id !== deleteId);
              break;
            }
            case 'drawing_create': {
              if (processedCreateIds.has(action.data.id)) {
                break;
              }
              processedCreateIds.add(action.data.id);
              let drawingNoteId = action.data.noteId;
              if (tempIdToRealId[drawingNoteId]) {
                drawingNoteId = tempIdToRealId[drawingNoteId];
              }
              const response = await apiClient.post(`/Drawings/${drawingNoteId}`, { drawingData: action.data.drawingData });
              const createdDrawing = response.data;
              const noteIndex = notes.findIndex((n: Note) => n.id === drawingNoteId);
              if (noteIndex !== -1 && notes[noteIndex].drawings) {
                const drawingIndex = notes[noteIndex].drawings.findIndex((d: any) => d.id === action.data.id);
                if (drawingIndex !== -1) {
                  notes[noteIndex].drawings[drawingIndex] = {
                    ...notes[noteIndex].drawings[drawingIndex],
                    id: createdDrawing.id.toString(),
                    noteId: drawingNoteId,
                    syncStatus: 'synced',
                    isOffline: false,
                    ...createdDrawing
                  };
                  notesToRemove.push(action.data.id);
                }
              }
              break;
            }
            case 'drawing_update': {
              let updateDrawingId = action.data.id;
              let updateDrawingNoteId = action.data.noteId;
              if (tempIdToRealId[updateDrawingNoteId]) {
                updateDrawingNoteId = tempIdToRealId[updateDrawingNoteId];
              }
              await apiClient.put(`/Drawings/${updateDrawingId}`, action.data.drawingData);
              const noteIndex = notes.findIndex((n: Note) => n.id === updateDrawingNoteId);
              if (noteIndex !== -1 && notes[noteIndex].drawings) {
                const drawingIndex = notes[noteIndex].drawings.findIndex((d: any) => d.id === updateDrawingId);
                if (drawingIndex !== -1) {
                  notes[noteIndex].drawings[drawingIndex].syncStatus = 'synced';
                }
              }
              break;
            }
            case 'drawing_delete': {
              let deleteDrawingId = action.data.id;
              let deleteDrawingNoteId = action.data.noteId;
              if (tempIdToRealId[deleteDrawingNoteId]) {
                deleteDrawingNoteId = tempIdToRealId[deleteDrawingNoteId];
              }
              await apiClient.delete(`/Drawings/${deleteDrawingId}`);
              const noteIndex = notes.findIndex((n: Note) => n.id === deleteDrawingNoteId);
              if (noteIndex !== -1 && notes[noteIndex].drawings) {
                notes[noteIndex].drawings = notes[noteIndex].drawings.filter((d: any) => d.id !== deleteDrawingId);
              }
              break;
            }
          }
        } catch (error) {
          console.error('[SYNC][ERROR]', error, 'Action:', action);
          updatedPending.push(action);
          console.log('[SYNC][PENDING] Başarısız, pendinge eklendi:', actionKey);
        }
      }

      // Eski geçici ID'li notları ve çizimleri sil
      if (notesToRemove.length > 0) {
        notes = notes.filter((n: Note) => !notesToRemove.includes(n.id));
        for (const note of notes) {
          if (note.drawings) {
            note.drawings = note.drawings.filter((d: any) => !notesToRemove.includes(d.id));
          }
        }
      }

      // Localdeki notları güncelle
      await offlineStorage.saveNotes(notes);
      // Sadece başarısız olanları pending'e yaz
      await AsyncStorage.setItem('@pending_sync', JSON.stringify(updatedPending));
      // Context veya ekrana state güncellemesi için callback çağır
      onSyncUpdate(notes);
    } finally {
      isSyncing = false;
    }
  }

  private transformApiNote(apiNote: any): Note {
    return {
      ...apiNote,
      id: apiNote.id.toString(),
      userId: apiNote.userId.toString(),
      folderId: apiNote.folderId?.toString() || null,
      parentFolderId: apiNote.parentFolderId?.toString() || null,
      isImportant: apiNote.isPinned,
      isPinned: apiNote.isPinned,
    };
  }
}

export const noteService = new NoteService(); 