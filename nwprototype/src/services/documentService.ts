import { apiClient as newApi } from './newApi';

export interface UploadDocumentDTO {
  title: string;
  file: File;
}

export interface Document {
  id: string;
  title: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
}

export const uploadDocument = async (title: string, file: File): Promise<Document> => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('file', file);

  const response = await newApi.post<Document>('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getDocument = async (documentId: string): Promise<Document> => {
  const response = await newApi.get<Document>(`/documents/${documentId}`);
  return response.data;
};

export const getDocuments = async (): Promise<Document[]> => {
  const response = await newApi.get<Document[]>('/documents');
  return response.data;
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  await newApi.delete(`/documents/${documentId}`);
}; 