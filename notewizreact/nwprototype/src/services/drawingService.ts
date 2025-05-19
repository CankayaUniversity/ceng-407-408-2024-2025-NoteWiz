import { apiClient } from './newApi';
import { offlineStorage } from './offlineStorage';
import NetInfo from '@react-native-community/netinfo';
import { Note } from './noteService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DrawingData {
  id: string;
  noteId: string;
  drawingData: string;
  createdAt: string;
  updatedAt?: string;
  isOffline?: boolean;
  syncStatus?: string;
}

class DrawingService {
  async saveDrawing(noteId: string, drawingData: string, onDrawingSaved?: (drawing: DrawingData) => void): Promise<DrawingData> {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    let savedDrawing: DrawingData;
    if (isConnected) {
      try {
        const response = await apiClient.post(`/Drawings/${noteId}`, { drawingData });
        savedDrawing = {
          ...response.data,
          id: response.data?.id?.toString?.() ?? '',
          noteId: response.data?.noteId?.toString?.() ?? ''
        };
        // Cache'e kaydet
        await this.cacheDrawing(savedDrawing);
      } catch (error) {
        console.error('Error saving drawing:', error);
        throw error;
      }
    } else {
      // Offline modda çizimi kaydet
      savedDrawing = {
        id: Date.now().toString(),
        noteId,
        drawingData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOffline: true,
        syncStatus: 'pending'
      };
      // Cache'e kaydet
      await this.cacheDrawing(savedDrawing);
      // Pending sync'e ekle
      await offlineStorage.savePendingSync('drawing_create', savedDrawing);
    }

    if (onDrawingSaved) {
      onDrawingSaved(savedDrawing);
    }
    return savedDrawing;
  }

  async getDrawings(noteId: string): Promise<DrawingData[]> {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (isConnected) {
      try {
        const response = await apiClient.get(`/Drawings/${noteId}`);
        const drawings = response.data.map((drawing: any) => ({
          ...drawing,
          id: drawing.id.toString(),
          noteId: drawing.noteId.toString()
        }));
        // Cache'e kaydet
        await this.cacheDrawings(noteId, drawings);
        return drawings;
      } catch (error) {
        console.error('Error fetching drawings:', error);
        // Hata durumunda cache'den oku
        return await this.getCachedDrawings(noteId);
      }
    } else {
      // Offline modda cache'den oku
      return await this.getCachedDrawings(noteId);
    }
  }

  private async cacheDrawing(drawing: DrawingData): Promise<void> {
    try {
      const cacheKey = `@drawing_${drawing.id}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(drawing));
      
      // Not ID'sine göre çizim listesini güncelle
      const noteDrawingsKey = `@note_drawings_${drawing.noteId}`;
      const existingDrawings = await this.getCachedDrawings(drawing.noteId);
      const updatedDrawings = [...existingDrawings.filter(d => d.id !== drawing.id), drawing];
      await AsyncStorage.setItem(noteDrawingsKey, JSON.stringify(updatedDrawings));
    } catch (error) {
      console.error('Error caching drawing:', error);
    }
  }

  private async cacheDrawings(noteId: string, drawings: DrawingData[]): Promise<void> {
    try {
      const cacheKey = `@note_drawings_${noteId}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(drawings));
    } catch (error) {
      console.error('Error caching drawings:', error);
    }
  }

  private async getCachedDrawings(noteId: string): Promise<DrawingData[]> {
    try {
      const cacheKey = `@note_drawings_${noteId}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      return cachedData ? JSON.parse(cachedData) : [];
    } catch (error) {
      console.error('Error reading cached drawings:', error);
      return [];
    }
  }

  async deleteDrawing(drawingId: string, noteId: string): Promise<void> {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    if (isConnected) {
      try {
        await apiClient.delete(`/Drawings/${drawingId}`);
        // Cache'den sil
        await this.removeDrawingFromCache(drawingId, noteId);
      } catch (error) {
        console.error('Error deleting drawing:', error);
        throw error;
      }
    } else {
      // Offline modda cache'den sil ve pending sync'e ekle
      await this.removeDrawingFromCache(drawingId, noteId);
      await offlineStorage.savePendingSync('drawing_delete', { id: drawingId, noteId });
    }
  }

  private async removeDrawingFromCache(drawingId: string, noteId: string): Promise<void> {
    try {
      // Tekil çizim cache'ini sil
      const cacheKey = `@drawing_${drawingId}`;
      await AsyncStorage.removeItem(cacheKey);
      
      // Not ID'sine göre çizim listesini güncelle
      const noteDrawingsKey = `@note_drawings_${noteId}`;
      const existingDrawings = await this.getCachedDrawings(noteId);
      const updatedDrawings = existingDrawings.filter(d => d.id !== drawingId);
      await AsyncStorage.setItem(noteDrawingsKey, JSON.stringify(updatedDrawings));
    } catch (error) {
      console.error('Error removing drawing from cache:', error);
    }
  }

  async updateDrawing(drawingId: string, drawingData: string): Promise<void> {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    
    if (isConnected) {
      try {
        await apiClient.put(`/Drawings/${drawingId}`, drawingData);
      } catch (error) {
        console.error('Error updating drawing:', error);
        throw error;
      }
    } else {
      // Offline modda çizimi güncelle
      const notes = await offlineStorage.getNotes();
      for (const note of notes) {
        if (note.drawings) {
          const drawingIndex = note.drawings.findIndex((d: DrawingData) => d.id === drawingId);
          if (drawingIndex !== -1) {
            note.drawings[drawingIndex] = {
              ...note.drawings[drawingIndex],
              drawingData,
              syncStatus: 'pending'
            };
            await offlineStorage.saveNotes(notes);
            await offlineStorage.savePendingSync('drawing_update', note.drawings[drawingIndex]);
            break;
          }
        }
      }
    }
  }

  async initializeDrawingsCache(notes: Note[]): Promise<void> {
    try {
      for (const note of notes) {
        if (note.drawings && note.drawings.length > 0) {
          // Her notun çizimlerini cache'e kaydet
          await this.cacheDrawings(note.id, note.drawings);
          
          // Her çizimi ayrı ayrı da cache'e kaydet
          for (const drawing of note.drawings) {
            await this.cacheDrawing(drawing);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing drawings cache:', error);
    }
  }
}

export const drawingService = new DrawingService(); 