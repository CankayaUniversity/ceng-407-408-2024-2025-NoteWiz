// src/contexts/TaskContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from './AuthContext';

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
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
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
      return;
    }

    // Firestore'dan görevleri dinle
    const unsubscribe = firestore()
    .collection('tasks')
    .where('userId', '==', user.id)
    .orderBy('dueDate', 'asc')  // Önce yaklaşan görevler
    .onSnapshot(
      (snapshot) => {
        try {
          const newTasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
            dueDate: doc.data().dueDate?.toDate(),
            reminder: doc.data().reminder?.toDate(),
          })) as Task[];
          console.log('Tasks fetched:', newTasks.length);
          setTasks(newTasks);
          setIsLoading(false);
        } catch (error) {
          console.error('Error processing tasks:', error);
          setTasks([]);
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Tasks listening error:', error);
        setTasks([]);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addTask = async (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    console.log('Adding task:', task.title);
    try {
      await firestore().collection('tasks').add({
        ...task,
        userId: user.id,
        completed: task.completed || false,
        priority: task.priority || 'medium',
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      console.log('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      throw new Error('Görev eklenirken bir hata oluştu.');
    }
  };

  const updateTask = async (id: string, taskUpdate: Partial<Task>) => {
    try {
      await firestore()
        .collection('tasks')
        .doc(id)
        .update({
          ...taskUpdate,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Görev güncellenirken bir hata oluştu.');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await firestore()
        .collection('tasks')
        .doc(id)
        .delete();
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