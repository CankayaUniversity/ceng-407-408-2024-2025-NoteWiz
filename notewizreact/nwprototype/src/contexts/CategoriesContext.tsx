// src/contexts/CategoriesContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

// API base URL - Doğru port numarası
const API_BASE_URL = API_URL;

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Timeout süresini artır
  timeout: 10000
});

// Request interceptor - her istekte token'ı ekle
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.error('Token alınırken hata:', error);
    return config;
  }
});

// Response interceptor - hata yönetimi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('İstek zaman aşımına uğradı');
    } else if (error.response) {
      // Sunucudan yanıt geldi ama hata kodu var
      console.error('API Hatası:', error.response.status, error.response.data);
    } else if (error.request) {
      // İstek yapıldı ama yanıt alınamadı
      console.error('Ağ Hatası:', error.message);
    } else {
      // İstek oluşturulurken hata oluştu
      console.error('İstek Hatası:', error.message);
    }
    return Promise.reject(error);
  }
);

// Kategori tipi
export interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
}

// Not tipi
export interface Note {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
}

// Context tipi
interface CategoriesContextType {
  categories: Category[];
  notes: Note[];
  loading: boolean;
  error: string | null;
  addCategory: (name: string, color: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  updateCategory: (id: number, name: string, color: string) => Promise<void>;
  addNote: (title: string, content: string, categoryId: number) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  moveNote: (noteId: number, newCategoryId: number) => Promise<void>;
}

// Context oluşturma
const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

// Provider bileşeni
export const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      fetchCategories();
    } else if (!isAuthenticated && !authLoading) {
      // Clear categories when not authenticated
      setCategories([]);
    }
  }, [isAuthenticated, user, authLoading]);

  // Kategorileri getir
  const fetchCategories = async () => {
    if (!user) {
      setCategories([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.get('/api/categories');
      // API yanıtını kontrol et
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.warn('API yanıtı beklenen formatta değil:', response.data);
        setCategories([]);
      }
    } catch (err) {
      console.error('Kategoriler yüklenirken hata:', err);
      setError('Kategoriler yüklenirken bir hata oluştu.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Notları getir
  const fetchNotes = async () => {
    try {
      const response = await api.get('/api/notes');
      // API yanıtını kontrol et
      if (response.data && Array.isArray(response.data)) {
        setNotes(response.data);
      } else {
        console.warn('API yanıtı beklenen formatta değil:', response.data);
        setNotes([]);
      }
    } catch (err) {
      console.error('Notlar yüklenirken hata:', err);
      setError('Notlar yüklenirken bir hata oluştu.');
      setNotes([]);
    }
  };

  // Kategori ekle
  const addCategory = async (name: string, color: string) => {
    if (!user || !isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await api.post('/api/categories', { name, color });
      // API yanıtını kontrol et
      if (response.data) {
        setCategories(prevCategories => [...prevCategories, response.data]);
      } else {
        throw new Error('API yanıtı geçersiz');
      }
    } catch (err) {
      console.error('Kategori eklenirken hata:', err);
      setError('Kategori eklenirken bir hata oluştu.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Kategori sil
  const deleteCategory = async (id: number) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      await api.delete(`/api/categories/${id}`);
      setCategories(prevCategories => prevCategories.filter(category => category.id !== id));
    } catch (err) {
      console.error('Kategori silinirken hata:', err);
      setError('Kategori silinirken bir hata oluştu.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Kategori güncelle
  const updateCategory = async (id: number, name: string, color: string) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await api.put(`/api/categories/${id}`, { name, color });
      // API yanıtını kontrol et
      if (response.data) {
        setCategories(prevCategories => 
          prevCategories.map(category => category.id === id ? response.data : category)
        );
      } else {
        throw new Error('API yanıtı geçersiz');
      }
    } catch (err) {
      console.error('Kategori güncellenirken hata:', err);
      setError('Kategori güncellenirken bir hata oluştu.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Not ekle
  const addNote = async (title: string, content: string, categoryId: number) => {
    if (!user || !isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await api.post('/api/notes', { title, content, categoryId });
      // API yanıtını kontrol et
      if (response.data) {
        setNotes(prevNotes => [...prevNotes, response.data]);
      } else {
        throw new Error('API yanıtı geçersiz');
      }
    } catch (err) {
      console.error('Not eklenirken hata:', err);
      setError('Not eklenirken bir hata oluştu.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Not sil
  const deleteNote = async (id: number) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      await api.delete(`/api/notes/${id}`);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (err) {
      console.error('Not silinirken hata:', err);
      setError('Not silinirken bir hata oluştu.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Not taşı
  const moveNote = async (noteId: number, newCategoryId: number) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await api.patch(`/api/notes/${noteId}/move`, { newCategoryId });
      // API yanıtını kontrol et
      if (response.data) {
        setNotes(prevNotes => prevNotes.map(note => note.id === noteId ? response.data : note));
      } else {
        throw new Error('API yanıtı geçersiz');
      }
    } catch (err) {
      console.error('Not taşınırken hata:', err);
      setError('Not taşınırken bir hata oluştu.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // İlk yüklemede kategorileri ve notları getir
  useEffect(() => {
    fetchCategories();
    fetchNotes();
  }, []);

  return (
    <CategoriesContext.Provider value={{ categories, notes, loading, error, addCategory, deleteCategory, updateCategory, addNote, deleteNote, moveNote }}>
      {children}
    </CategoriesContext.Provider>
  );
};

// Hook
export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};