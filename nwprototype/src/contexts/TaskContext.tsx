// src/contexts/TaskContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from './AuthContext';
import auth from '@react-native-firebase/auth';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  categoryId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  reminder?: Date; // Hatırlatıcı için
  relatedNoteId?: string; // Bir nota bağlıysa
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleCompleted: (id: string) => Promise<void>;
  isLoading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setIsLoading(false);
      return () => {};
    }
    
    console.log('Setting up Firestore listener for tasks with user ID:', user.id);
    setIsLoading(true);
  
    const unsubscribe = firestore()
      .collection('tasks')
      .where('userId', '==', user.id)
      .orderBy('createdAt', 'desc') // Changed to createdAt to avoid potential issues with null dueDate
      .onSnapshot(
        (snapshot) => {
          try {
            console.log('Snapshot received, docs count:', snapshot.docs.length);
            const newTasks = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                dueDate: data.dueDate?.toDate(),
                reminder: data.reminder?.toDate(),
              };
            }) as Task[];
            
            setTasks(newTasks);
          } catch (error) {
            console.error('Error processing tasks:', error);
            setTasks([]);
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Tasks listening error:', error);
          setTasks([]);
          setIsLoading(false);
        }
      );
  
    return () => {
      console.log('Cleaning up Firestore listener');
      unsubscribe();
    };
  }, [user]);
  
  const addTask = async (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!user) {
      throw new Error('Kullanıcı doğrulanmadı');
    }
  
    console.log('Adding task:', task.title);
    try {
      const docRef = await firestore().collection('tasks').add({
        ...task,
        userId: user.id,
        completed: task.completed ?? false,
        priority: task.priority || 'medium',
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      
      console.log('Task added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding task:', error);
      throw new Error('Görev eklenirken bir hata oluştu.');
    }
  };
  
  const updateTask = async (id: string, taskUpdate: Partial<Task>) => {
    if (!user) {
      throw new Error('Kullanıcı doğrulanmadı');
    }
    
    try {
      const updateData: any = {
        ...taskUpdate,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };
      
      // Make sure we don't try to update id or userId
      delete updateData.id;
      delete updateData.userId;
      
      await firestore()
        .collection('tasks')
        .doc(id)
        .update(updateData);
        
      console.log('Task updated successfully:', id);
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Görev güncellenirken bir hata oluştu.');
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) {
      throw new Error('Kullanıcı doğrulanmadı');
    }
    
    try {
      await firestore()
        .collection('tasks')
        .doc(id)
        .delete();
        
      console.log('Task deleted successfully:', id);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Görev silinirken bir hata oluştu.');
    }
  };

  const toggleCompleted = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) {
        throw new Error('Görev bulunamadı');
      }
      
      await updateTask(id, { completed: !task.completed });
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
  };

  return (
    <TaskContext.Provider 
      value={{ 
        tasks, 
        addTask, 
        updateTask, 
        deleteTask,
        toggleCompleted,
        isLoading
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};