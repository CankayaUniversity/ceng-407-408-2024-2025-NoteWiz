import React, { createContext, useContext, useState, useCallback } from 'react';
import { Document, documentService, UploadDocumentDTO, UpdateDocumentDTO } from '../services/documentService';

// Types
interface DocumentContextData {
  documents: Document[];
  loading: boolean;
  error: string | null;
  loadDocuments: () => Promise<void>;
  uploadDocument: (data: UploadDocumentDTO) => Promise<Document>;
  updateDocument: (id: string, data: UpdateDocumentDTO) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  extractText: (id: string) => Promise<string>;
  clearError: () => void;
}

// Context
const DocumentContext = createContext<DocumentContextData>({} as DocumentContextData);

// Hook
export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};

// Provider Component
export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Document Operations
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await documentService.getDocuments();
      setDocuments(response);
    } catch (err) {
      setError('Dökümanlar yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (data: UploadDocumentDTO) => {
    try {
      setLoading(true);
      const newDocument = await documentService.uploadDocument(data);
      setDocuments(prev => [...prev, newDocument]);
      return newDocument;
    } catch (err) {
      setError('Döküman yüklenirken bir hata oluştu');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDocument = useCallback(async (id: string, data: UpdateDocumentDTO) => {
    try {
      setLoading(true);
      const updatedDocument = await documentService.updateDocument(id, data);
      setDocuments(prev => prev.map(doc => 
        doc.id === id ? updatedDocument : doc
      ));
      return updatedDocument;
    } catch (err) {
      setError('Döküman güncellenirken bir hata oluştu');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await documentService.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      setError('Döküman silinirken bir hata oluştu');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const extractText = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const text = await documentService.extractText(id);
      return text;
    } catch (err) {
      setError('Metin çıkarılırken bir hata oluştu');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context Value
  const value = {
    documents,
    loading,
    error,
    loadDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    extractText,
    clearError,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}; 