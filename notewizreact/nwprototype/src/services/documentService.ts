import { apiClient } from './newApi';

// Types
export interface Document {
  id: string;
  title: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  content: string;
  isPrivate: boolean;
  tags: string;
  categoryId?: number;
  createdAt: string;
  updatedAt?: string;
  userId: string;
}

export interface UploadDocumentDTO {
  file: {
    uri: string;
    type: string;
    name: string;
  };
}

export interface UpdateDocumentDTO {
  title: string;
  content: string;
  isPrivate: boolean;
  tags: string;
  categoryId?: number;
}

// API Endpoints
const ENDPOINTS = {
  DOCUMENTS: '/Documents',
  UPLOAD: '/Documents/upload',
  EXTRACT_TEXT: (id: string) => `/Documents/${id}/extract-text`,
} as const;

class DocumentService {
  // Document CRUD Operations
  async uploadDocument(data: UploadDocumentDTO): Promise<Document> {
    const formData = new FormData();
    formData.append('file', {
      uri: data.file.uri,
      type: data.file.type,
      name: data.file.name,
    } as any);

    const response = await apiClient.post(ENDPOINTS.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return this.transformApiDocument(response.data.document || response.data);
  }

  async getDocuments(): Promise<Document[]> {
    const response = await apiClient.get(ENDPOINTS.DOCUMENTS);
    return Array.isArray(response.data) ? response.data.map(this.transformApiDocument) : [];
  }

  async getDocument(id: string): Promise<Document> {
    const response = await apiClient.get(`${ENDPOINTS.DOCUMENTS}/${id}`);
    return this.transformApiDocument(response.data);
  }

  async updateDocument(id: string, data: UpdateDocumentDTO): Promise<Document> {
    const response = await apiClient.put(`${ENDPOINTS.DOCUMENTS}/${id}`, data);
    return this.transformApiDocument(response.data);
  }

  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.DOCUMENTS}/${id}`);
  }

  async extractText(id: string): Promise<string> {
    const response = await apiClient.post(ENDPOINTS.EXTRACT_TEXT(id));
    return response.data.text;
  }

  // Helper Methods
  private transformApiDocument(apiDocument: any): Document {
    return {
      id: apiDocument.id?.toString() || '',
      title: apiDocument.title || '',
      filePath: apiDocument.filePath || '',
      fileName: apiDocument.fileName || '',
      fileSize: apiDocument.fileSize || 0,
      content: apiDocument.content || '',
      isPrivate: apiDocument.isPrivate || false,
      tags: apiDocument.tags || '',
      categoryId: apiDocument.categoryId,
      createdAt: apiDocument.createdAt || '',
      updatedAt: apiDocument.updatedAt,
      userId: apiDocument.userId?.toString() || '',
    };
  }
}

export const documentService = new DocumentService(); 