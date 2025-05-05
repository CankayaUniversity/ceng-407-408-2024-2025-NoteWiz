// src/contexts/CategoriesContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { categoriesService } from '../services/api';
import { useAuth } from './AuthContext';

export interface Category {
  id: number;
  name: string;
  color?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesContextType {
  categories: Category[];
  addCategory: (name: string, color?: string) => Promise<void>;
  updateCategory: (id: number, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
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
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      const data = await categoriesService.getCategories(userId);
      setCategories(data);
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
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      await categoriesService.addCategory({ name, color, userId });
      await fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (id: number, data: Partial<Category>) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      await categoriesService.updateCategory(id, data);
      await fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      await categoriesService.deleteCategory(id);
      await fetchCategories();
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