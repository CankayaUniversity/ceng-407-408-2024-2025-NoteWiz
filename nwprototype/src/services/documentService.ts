import { apiClient } from './newApi';

export interface Document {
  id: string;
  filePath: string;
  extractedText: string;
  uploadedAt: string;
  userId: string;
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

    const response = await apiClient.post('/Documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return this.transformApiDocument(response.data);
  }

  async getDocuments(): Promise<Document[]> {
    const response = await apiClient.get('/Documents');
    return response.data.map(this.transformApiDocument);
  }

  async getDocument(id: string): Promise<Document> {
    const response = await apiClient.get(`/Documents/${id}`);
    return this.transformApiDocument(response.data);
  }

  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/Documents/${id}`);
  }

  async extractText(id: string): Promise<string> {
    const response = await apiClient.post(`/Documents/${id}/extract-text`);
    return response.data.text;
  }

  private transformApiDocument(apiDocument: any): Document {
    return {
      ...apiDocument,
      id: apiDocument.id.toString(),
      userId: apiDocument.userId.toString()
    };
  }
}

export const documentService = new DocumentService(); 