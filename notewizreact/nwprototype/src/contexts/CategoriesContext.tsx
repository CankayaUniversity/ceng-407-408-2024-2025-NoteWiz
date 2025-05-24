// src/contexts/CategoriesContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiClient } from '../services/newApi';

// Kategori tipi
export interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
}

// Context tipi
interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  addCategory: (name: string, color: string) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
  updateCategory: (id: number, name: string, color: string) => Promise<void>;
}

// Context oluşturma
const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

// Provider bileşeni
export const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: 'Work', color: '#4C6EF5' }
  ]);
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
      const response = await apiClient.get('/categories');
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

  // Kategori ekle
  const addCategory = async (name: string, color: string): Promise<Category> => {
    if (!user || !isAuthenticated) throw new Error('Not authenticated');
    setLoading(true);
    try {
      console.log('[addCategory] Başladı:', { name, color });
      // Sadece name gönder
      const response = await apiClient.post('/categories', { name });
      console.log('[addCategory] API yanıtı:', response.status, response.data);
      // API yanıtını kontrol et
      if (response.data) {
        const newCategory = response.data;
        setCategories(prevCategories => [...prevCategories, newCategory]);
        console.log('[addCategory] Yeni kategori eklendi:', newCategory);
        return newCategory;
      } else {
        throw new Error('API yanıtı geçersiz');
      }
    } catch (err) {
      console.error('[addCategory] Hata:', err);
      setError('Kategori eklenirken bir hata oluştu.');
      throw err;
    } finally {
      setLoading(false);
      console.log('[addCategory] Bitti');
    }
  };

  // Kategori sil
  const deleteCategory = async (id: number) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      await apiClient.delete(`/categories/${id}`);
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
      const response = await apiClient.put(`/categories/${id}`, { name, color });
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

  return (
    <CategoriesContext.Provider value={{
      categories,
      loading,
      error,
      addCategory,
      deleteCategory,
      updateCategory
    }}>
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