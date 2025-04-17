// src/contexts/CategoriesContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from './AuthContext';

export interface Category {
 id: string;
 name: string;
 userId: string;
 color?: string;
 createdAt: Date;
 updatedAt: Date;
}

interface CategoriesContextType {
 categories: Category[];
 addCategory: (name: string, color?: string) => Promise<void>;
 updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
 deleteCategory: (id: string) => Promise<void>;
 isLoading: boolean;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

// Varsayılan kategoriler
const DEFAULT_CATEGORIES = [
 { name: 'Work', color: '#4C6EF5' },
 { name: 'Personal', color: '#82C91E' },
 { name: 'Shopping', color: '#FD7E14' },
 { name: 'Ideas', color: '#BE4BDB' },
 { name: 'To-Do', color: '#FA5252' },
 { name: 'Other', color: '#868E96' }
];

export const CategoriesProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
 const [categories, setCategories] = useState<Category[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const { user } = useAuth();

 useEffect(() => {
   if (!user) {
     setCategories([]);
     setIsLoading(false);
     return;
   }

   const initializeCategories = async () => {
     try {
       // Kullanıcının mevcut kategorilerini kontrol et
       const snapshot = await firestore()
         .collection('categories')
         .where('userId', '==', user.id)
         .get();

       // Eğer kullanıcının hiç kategorisi yoksa varsayılan kategorileri ekle
       if (snapshot.empty) {
         const batch = firestore().batch();
         
         DEFAULT_CATEGORIES.forEach(category => {
           const docRef = firestore().collection('categories').doc();
           batch.set(docRef, {
             ...category,
             userId: user.id,
             createdAt: firestore.FieldValue.serverTimestamp(),
             updatedAt: firestore.FieldValue.serverTimestamp(),
           });
         });

         await batch.commit();
       }
     } catch (error) {
       console.error('Error initializing categories:', error);
     }
   };

   initializeCategories();

   // Kategorileri dinlemeye devam et
   const unsubscribe = firestore()
     .collection('categories')
     .where('userId', '==', user.id)
     .orderBy('name')
     .onSnapshot(
       snapshot => {
         const newCategories = snapshot.docs.map(doc => ({
           id: doc.id,
           ...doc.data(),
           createdAt: doc.data().createdAt?.toDate(),
           updatedAt: doc.data().updatedAt?.toDate(),
         })) as Category[];
         setCategories(newCategories);
         setIsLoading(false);
       },
       error => {
         console.error('Categories listening error:', error);
         setCategories([]);
         setIsLoading(false);
       }
     );

   return () => unsubscribe();
 }, [user]);

 const addCategory = async (name: string, color?: string) => {
   if (!user) return;

   try {
     // Kategori adının benzersiz olup olmadığını kontrol et
     const existingCategory = categories.find(
       cat => cat.name.toLowerCase() === name.toLowerCase()
     );

     if (existingCategory) {
       throw new Error('Bu kategori adı zaten kullanılmakta.');
     }

     await firestore().collection('categories').add({
       name,
       color,
       userId: user.id,
       createdAt: firestore.FieldValue.serverTimestamp(),
       updatedAt: firestore.FieldValue.serverTimestamp(),
     });
   } catch (error) {
     console.error('Error adding category:', error);
     throw error instanceof Error ? error : new Error('Kategori eklenirken bir hata oluştu.');
   }
 };

 const updateCategory = async (id: string, data: Partial<Category>) => {
   try {
     // Eğer isim güncellemesi yapılıyorsa, benzersizliği kontrol et
     if (data.name) {
       const existingCategory = categories.find(
         cat => cat.name.toLowerCase() === data.name?.toLowerCase() && cat.id !== id
       );

       if (existingCategory) {
         throw new Error('Bu kategori adı zaten kullanılmakta.');
       }
     }

     await firestore()
       .collection('categories')
       .doc(id)
       .update({
         ...data,
         updatedAt: firestore.FieldValue.serverTimestamp(),
       });
   } catch (error) {
     console.error('Error updating category:', error);
     throw error instanceof Error ? error : new Error('Kategori güncellenirken bir hata oluştu.');
   }
 };

 const deleteCategory = async (id: string) => {
   try {
     // Kategoriyi kullanan notları kontrol et
     const notesSnapshot = await firestore()
       .collection('notes')
       .where('userId', '==', user?.id)
       .where('category', '==', id)
       .get();

     if (!notesSnapshot.empty) {
       // Bu kategoriyi kullanan notlar varsa, hata ver
       throw new Error('Bu kategori kullanımda olan notlar içeriyor. Önce notları başka bir kategoriye taşıyın.');
     }

     await firestore()
       .collection('categories')
       .doc(id)
       .delete();
   } catch (error) {
     console.error('Error deleting category:', error);
     throw error instanceof Error ? error : new Error('Kategori silinirken bir hata oluştu.');
   }
 };

 return (
   <CategoriesContext.Provider 
     value={{ 
       categories, 
       addCategory, 
       updateCategory, 
       deleteCategory,
       isLoading
     }}
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