import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient as newApi } from '../services/newApi';

interface Document {
  id: string;
  title: string;
  filePath: string;
  createdAt: string;
  extractedText?: string;
}

interface DocumentContextType {
  documents: Document[];
  loading: boolean;
  error: string | null;
  uploadDocument: (file: any) => Promise<void>;
  getDocument: (id: string) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  extractText: (id: string) => Promise<string>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await newApi.get('/api/documents');
      setDocuments(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Dokümanlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await newApi.post('/api/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setDocuments((prev) => [...prev, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Error uploading document:', err);
      throw new Error('Doküman yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getDocument = async (id: string) => {
    try {
      const response = await newApi.get(`/api/documents/${id}`);
      return response.data;
    } catch (err) {
      console.error('Error getting document:', err);
      throw new Error('Doküman alınırken bir hata oluştu');
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await newApi.delete(`/api/documents/${id}`);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting document:', err);
      throw new Error('Doküman silinirken bir hata oluştu');
    }
  };

  const extractText = async (id: string) => {
    try {
      const response = await newApi.post(`/api/documents/${id}/extract`);
      return response.data.text;
    } catch (err) {
      console.error('Error extracting text:', err);
      throw new Error('Metin çıkarılırken bir hata oluştu');
    }
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        loading,
        error,
        uploadDocument,
        getDocument,
        deleteDocument,
        extractText,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export default DocumentProvider; 