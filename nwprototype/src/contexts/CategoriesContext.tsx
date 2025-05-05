// src/contexts/CategoriesContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/newApi';
import { useAuth } from './AuthContext';

export interface Category {
  id: string;
  name: string;
  color?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesContextType {
  categories: Category[];
  addCategory: (name: string, color?: string) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  isLoading: boolean;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      fetchCategories();
    } else if (!isAuthenticated && !authLoading) {
      // Clear categories when not authenticated
      setCategories([]);
    }
  }, [isAuthenticated, user, authLoading]);

  const fetchCategories = async () => {
    if (!user) {
      setCategories([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiClient.get('/Categories');
      // Check if response.data exists and is an array
      if (response.data && Array.isArray(response.data)) {
        const formattedCategories = response.data.map((category: any) => ({
          ...category,
          id: category.id.toString(),
          userId: category.userId.toString()
        }));
        setCategories(formattedCategories);
      } else {
        // If endpoint is not available, set empty array
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async (name: string, color?: string) => {
    if (!user || !isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.post('/Categories', { name, color });
      const newCategory: Category = {
        ...response.data,
        id: response.data.id.toString(),
        userId: response.data.userId.toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCategories(prevCategories => [...prevCategories, newCategory]);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.put(`/Categories/${id}`, data);
      const updatedCategory: Category = {
        ...response.data,
        id: response.data.id.toString(),
        userId: response.data.userId.toString()
      };
      setCategories(prevCategories => 
        prevCategories.map(category => category.id === id ? updatedCategory : category)
      );
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      await apiClient.delete(`/Categories/${id}`);
      setCategories(prevCategories => prevCategories.filter(category => category.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CategoriesContext.Provider 
      value={{ categories, addCategory, updateCategory, deleteCategory, isLoading }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};