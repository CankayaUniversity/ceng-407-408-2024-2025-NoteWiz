// src/contexts/TaskContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Task, CreateTaskDto } from '../services/taskService';
import taskService from '../services/taskService';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (taskData: CreateTaskDto) => Promise<Task>;
  updateTask: (taskId: string, taskData: Partial<CreateTaskDto>) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleCompleted: (taskId: string) => Promise<void>;
  fetchTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await taskService.getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görevler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = useCallback(async (taskData: CreateTaskDto): Promise<Task> => {
    try {
      setLoading(true);
      setError(null);
      const newTask = await taskService.createTask(taskData);
<<<<<<< HEAD
      if (!newTask.id) {
        throw new Error('Görev oluşturulamadı, id alanı yok!');
      }
=======
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
      setTasks(prevTasks => [...prevTasks, newTask]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görev oluşturulurken bir hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (taskId: string, taskData: Partial<CreateTaskDto>): Promise<Task> => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await taskService.updateTask(taskId, taskData);
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görev güncellenirken bir hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await taskService.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görev silinirken bir hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleCompleted = useCallback(async (taskId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Görev bulunamadı');
      
      const updatedTask = await taskService.updateTask(taskId, { completed: !task.completed });
      setTasks(prevTasks => prevTasks.map(t => 
        t.id === taskId ? updatedTask : t
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görev durumu güncellenirken bir hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tasks]);

  return (
    <TaskContext.Provider value={{
      tasks,
      loading,
      error,
      addTask,
      updateTask,
      deleteTask,
      toggleCompleted,
      fetchTasks,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export type { Task };