import { apiClient } from './newApi';

export interface DrawingData {
  id: string;
  noteId: string;
  drawingData: string;
  createdAt: string;
}

class DrawingService {
  async saveDrawing(noteId: string, drawingData: string): Promise<DrawingData> {
    try {
      console.log('Gönderilen noteId:', noteId);
      console.log('Gönderilen drawingData:', drawingData);
      const response = await apiClient.post(`/Drawings/${noteId}`, { drawingData });
      console.log('Backend yanıtı:', response.data);
      return {
        ...response.data,
        id: response.data?.id?.toString?.() ?? '',
        noteId: response.data?.noteId?.toString?.() ?? ''
      };
    } catch (error) {
      console.error('Error saving drawing:', error);
      throw error;
    }
  }

  async getDrawings(noteId: string): Promise<DrawingData[]> {
    try {
      const response = await apiClient.get(`/Drawings/${noteId}`);
      return Array.isArray(response.data) ? response.data.map((drawing: any) => ({
        ...drawing,
        id: drawing?.id?.toString?.() ?? '',
        noteId: drawing?.noteId?.toString?.() ?? ''
      })) : [];
    } catch (error) {
      console.error('Error getting drawings:', error);
      throw error;
    }
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