import { apiClient } from './api';

export interface Document {
  id: number;
  filePath: string;
  extractedText: string;
  uploadedAt: string;
  userId: number;
}

export interface UploadDocumentDTO {
  file: {
    uri: string;
    type: string;
    name: string;
  };
}

class DocumentService {
  async uploadDocument(data: UploadDocumentDTO): Promise<Document> {
    const formData = new FormData();
    formData.append('file', {
      uri: data.file.uri,
      type: data.file.type,
      name: data.file.name,
    } as any);

    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getDocuments(): Promise<Document[]> {
    const response = await apiClient.get('/documents');
    return response.data;
  }

  async getDocument(id: number): Promise<Document> {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  }

  async deleteDocument(id: number): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
  }

  async extractText(id: number): Promise<string> {
    const response = await apiClient.post(`/documents/${id}/extract-text`);
    return response.data.text;
  }
}

export const documentService = new DocumentService(); 