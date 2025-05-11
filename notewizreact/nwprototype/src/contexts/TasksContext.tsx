// src/contexts/TasksContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { tasksService } from '../services/newApi';
import { useAuth } from './AuthContext';

// Task type definition
export interface Task {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  dueDate?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface TasksContextType {
  tasks: Task[];
  isLoading: boolean;
  addTask: (taskData: Partial<Task>) => Promise<Task>;
  updateTask: (id: number, taskData: Partial<Task>) => Promise<Task>;
  deleteTask: (id: number) => Promise<boolean>;
  completeTask: (id: number) => Promise<boolean>;
}

// Create context
const TasksContext = createContext<TasksContextType>({
  tasks: [],
  isLoading: false,
  addTask: async () => null as any,
  updateTask: async () => null as any,
  deleteTask: async () => false,
  completeTask: async () => false,
});

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchTasks();
    } else if (!isAuthenticated && !authLoading) {
      setTasks([]);
    }
  }, [isAuthenticated, authLoading]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await tasksService.getTasks();
      console.log('Fetched tasks:', data);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (taskData: Partial<Task>): Promise<Task> => {
    if (!isAuthenticated) return null as any;
    try {
      const apiTaskData = {
        title: taskData.title || "New Task",
        description: taskData.description || "",
        dueDate: taskData.dueDate,
        reminder: (taskData as any).reminder,
      };
      const createdTask = await tasksService.createTask(apiTaskData);
      setTasks(prevTasks => [...prevTasks, createdTask]);
      return createdTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (id: number, taskData: Partial<Task>): Promise<Task> => {
    if (!isAuthenticated) return null as any;
    try {
      const apiTaskData = {
        title: taskData.title || '',
        description: taskData.description || '',
        dueDate: taskData.dueDate,
        reminder: (taskData as any).reminder,
      };
      const updatedTask = await tasksService.updateTask(id, apiTaskData);
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === id ? updatedTask : task)
      );
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: number): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      await tasksService.deleteTask(id);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  };

  const completeTask = async (id: number): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      const updatedTask = await tasksService.completeTask(id);
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === id ? updatedTask : task)
      );
      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      return false;
    }
  };

  const contextValue = {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    completeTask
  };

  return (
    <TasksContext.Provider value={contextValue}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => useContext(TasksContext); 