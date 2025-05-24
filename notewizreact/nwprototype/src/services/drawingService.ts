import { apiClient } from './newApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface DrawingData {
  id: string;
  noteId: string;
  drawingData: string;
  createdAt: string;
}

// Çizim cache ve pending yardımcıları
const cacheDrawings = async (noteId: string, drawingData: string) => {
  const cached = await AsyncStorage.getItem('cachedDrawings');
  const drawings = cached ? JSON.parse(cached) : {};
  drawings[noteId] = drawingData;
  await AsyncStorage.setItem('cachedDrawings', JSON.stringify(drawings));
};
const getCachedDrawing = async (noteId: string): Promise<string | null> => {
  const cached = await AsyncStorage.getItem('cachedDrawings');
  const drawings = cached ? JSON.parse(cached) : {};
  return drawings[noteId] || null;
};
const getPendingDrawings = async (): Promise<{noteId: string, drawingData: string}[]> => {
  const pending = await AsyncStorage.getItem('pendingDrawings');
  return pending ? JSON.parse(pending) : [];
};
const setPendingDrawings = async (pending: {noteId: string, drawingData: string}[]) => {
  await AsyncStorage.setItem('pendingDrawings', JSON.stringify(pending));
};

let isOffline = false;
NetInfo.addEventListener(state => { isOffline = !state.isConnected; });

class DrawingService {
  async saveDrawing(noteId: string, drawingData: string): Promise<DrawingData> {
    if (isOffline) {
      // Cache ve pending'e ekle
      await cacheDrawings(noteId, drawingData);
      const pending = await getPendingDrawings();
      // Aynı noteId varsa güncelle
      const idx = pending.findIndex(d => d.noteId === noteId);
      if (idx !== -1) {
        pending[idx] = { noteId, drawingData };
      } else {
        pending.push({ noteId, drawingData });
      }
      await setPendingDrawings(pending);
      return { id: Date.now().toString(), noteId, drawingData, createdAt: new Date().toISOString() };
    } else {
      // Online: API'ye kaydet ve cache'e yaz
      const response = await apiClient.post(`/Drawings/${noteId}`, { drawingData });
      await cacheDrawings(noteId, drawingData);
      return {
        ...response.data,
        id: response.data?.id?.toString?.() ?? '',
        noteId: response.data?.noteId?.toString?.() ?? ''
      };
    }
  }

  async getDrawings(noteId: string): Promise<DrawingData[]> {
    if (isOffline) {
      const cached = await getCachedDrawing(noteId);
      if (cached) {
        return [{ id: noteId, noteId, drawingData: cached, createdAt: new Date().toISOString() }];
      }
      return [];
    } else {
      const response = await apiClient.get(`/Drawings/${noteId}`);
      // Son çizimi cache'e yaz
      if (Array.isArray(response.data) && response.data.length > 0) {
        await cacheDrawings(noteId, response.data[response.data.length - 1].drawingData);
      }
      return Array.isArray(response.data) ? response.data.map((drawing: any) => ({
        ...drawing,
        id: drawing?.id?.toString?.() ?? '',
        noteId: drawing?.noteId?.toString?.() ?? ''
      })) : [];
    }
  }

  async syncPendingDrawings() {
    if (isOffline) return;
    const pending = await getPendingDrawings();
    const synced: string[] = [];
    for (const item of pending) {
      try {
        console.log('[SYNC] Pending çizim gönderiliyor:', { noteId: item.noteId, drawingData: item.drawingData });
        const resp = await apiClient.post(`/Drawings/${item.noteId}`, { drawingData: item.drawingData });
        console.log('[SYNC] Backend çizim cevabı:', resp.data);
        synced.push(item.noteId);
      } catch (e) {
        console.log('[SYNC] Çizim gönderilemedi:', item, e);
      }
    }
    // Başarılı olanları pending listesinden çıkar
    const newPending = pending.filter(d => !synced.includes(d.noteId));
    await setPendingDrawings(newPending);
  }

  async deleteDrawing(drawingId: string): Promise<void> {
    try {
      await apiClient.delete(`/Drawings/${drawingId}`);
    } catch (error) {
      console.error('Error deleting drawing:', error);
      throw error;
    }
  }

  async updateDrawing(drawingId: string, drawingData: string): Promise<void> {
    try {
      await apiClient.put(`/Drawings/${drawingId}`, drawingData);
    } catch (error) {
      console.error('Error updating drawing:', error);
      throw error;
    }
  }
}

export const drawingService = new DrawingService(); 