import React, { createContext, useContext, useState, useCallback } from 'react';
import { Document, documentService, UploadDocumentDTO } from '../services/documentService';

interface DocumentContextData {
  documents: Document[];
  loading: boolean;
  error: string | null;
  loadDocuments: () => Promise<void>;
  uploadDocument: (data: UploadDocumentDTO) => Promise<Document>;
  deleteDocument: (id: number) => Promise<void>;
  extractText: (id: number) => Promise<string>;
  clearError: () => void;
}

const DocumentContext = createContext<DocumentContextData>({} as DocumentContextData);

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await documentService.getDocuments();
      setDocuments(response);
    } catch (err) {
      setError('Failed to load documents');
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
      setError('Failed to upload document');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await documentService.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      setError('Failed to delete document');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const extractText = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const text = await documentService.extractText(id);
      return text;
    } catch (err) {
      setError('Failed to extract text');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <DocumentContext.Provider
      value={{
        documents,
        loading,
        error,
        loadDocuments,
        uploadDocument,
        deleteDocument,
        extractText,
        clearError,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}; 