// src/contexts/TaskContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { tasksService } from '../services/api';
import { useAuth } from './AuthContext';

// Task type definition
export interface Task {
  id: string; // Will be converted from number to string
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  reminder?: Date;
  // API may use completed or isCompleted
  completed: boolean; 
  isCompleted?: boolean;
  userId: string;
  categoryId?: string;
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

// For creating new tasks
export interface TaskData {
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  reminder?: Date;
  completed?: boolean;
  categoryId?: string;
}

interface TasksContextType {
  tasks: Task[];
  isLoading: boolean;
  addTask: (taskData: TaskData) => Promise<string>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  toggleCompleted: (id: string) => Promise<boolean>;
}

// Create context
const TaskContext = createContext<TasksContextType>({
  tasks: [],
  isLoading: false,
  addTask: async () => "",
  updateTask: async () => false,
  deleteTask: async () => false,
  toggleCompleted: async () => false,
});

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Only fetch tasks when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchTasks();
    } else if (!isAuthenticated && !authLoading) {
      // Clear tasks when not authenticated
      setTasks([]);
    }
  }, [isAuthenticated, authLoading]);

  // Get tasks from API
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await tasksService.getTasks();
      
      // Process API data
      const formattedTasks = data.map((task: any) => ({
        ...task,
        id: task.id.toString(), // Convert Int to string
        userId: task.userId.toString(),
        categoryId: task.categoryId ? task.categoryId.toString() : undefined,
        // Support both isCompleted and completed
        completed: task.isCompleted !== undefined ? task.isCompleted : task.completed,
        // Convert date strings to Date objects
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        reminder: task.reminder ? new Date(task.reminder) : undefined,
        createdAt: new Date(task.createdAt),
        updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined
      }));
      
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Use empty array on error
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new task
  const addTask = async (taskData: TaskData): Promise<string> => {
    if (!isAuthenticated) return "";
    
    try {
      // Prepare data for API
      const apiTaskData = {
        description: taskData.title, // API may use description instead of title
        dueDate: taskData.dueDate,
        priority: taskData.priority || "medium",
        reminder: taskData.reminder,
        isCompleted: taskData.completed || false
      };
      
      // Add task to API
      const createdTask = await tasksService.createTask(apiTaskData);
      
      // Process and add created task to state
      const newTask: Task = {
        ...createdTask,
        id: createdTask.id.toString(),
        userId: createdTask.userId.toString(),
        categoryId: createdTask.categoryId ? createdTask.categoryId.toString() : undefined,
        title: taskData.title, // If API returns description, map back to title
        completed: createdTask.isCompleted !== undefined ? createdTask.isCompleted : createdTask.completed,
        isCompleted: createdTask.isCompleted !== undefined ? createdTask.isCompleted : createdTask.completed,
        dueDate: createdTask.dueDate ? new Date(createdTask.dueDate) : undefined,
        reminder: createdTask.reminder ? new Date(createdTask.reminder) : undefined,
        createdAt: new Date(createdTask.createdAt),
        updatedAt: createdTask.updatedAt ? new Date(createdTask.updatedAt) : undefined,
        completedAt: createdTask.completedAt ? new Date(createdTask.completedAt) : undefined
      };
      
      setTasks(prevTasks => [...prevTasks, newTask]);
      return newTask.id;
    } catch (error) {
      console.error('Error adding task:', error);
      return "";
    }
  };

  // Update task
  const updateTask = async (id: string, taskData: Partial<Task>): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      // Prepare data for API
      const apiTaskData = {
        description: taskData.title || taskData.description,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        reminder: taskData.reminder,
        isCompleted: taskData.completed
      };
      
      // Update task in API
      const updatedTask = await tasksService.updateTask(parseInt(id), apiTaskData);
      
      // Update task in state
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === id) {
            return {
              ...task,
              ...taskData,
              // Add API response values
              title: taskData.title || task.title,
              description: updatedTask.description || task.description,
              dueDate: taskData.dueDate || task.dueDate,
              priority: taskData.priority || task.priority,
              reminder: taskData.reminder || task.reminder,
              completed: taskData.completed !== undefined ? taskData.completed : task.completed,
              isCompleted: taskData.completed !== undefined ? taskData.completed : task.isCompleted,
              updatedAt: new Date()
            };
          }
          return task;
        })
      );
      
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      
      // Try UI update anyway
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === id) {
            return {
              ...task,
              ...taskData,
              title: taskData.title || task.title,
              updatedAt: new Date()
            };
          }
          return task;
        })
      );
      
      return false;
    }
  };

  // Delete task
  const deleteTask = async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      // Delete task from API
      await tasksService.deleteTask(parseInt(id));
      
      // Remove task from state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      
      // Try to remove from UI
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      return false;
    }
  };

  // Toggle task completed/uncompleted status
  const toggleCompleted = async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      // Find current task
      const task = tasks.find(t => t.id === id);
      if (!task) return false;
      
      const newCompletedStatus = !task.completed;
      
      // Make API request
      if (newCompletedStatus) {
        // Mark as completed
        await tasksService.completeTask(parseInt(id));
      } else {
        // Revert with normal update
        await tasksService.updateTask(parseInt(id), { 
          isCompleted: false
        });
      }
      
      // Update task in state
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === id) {
            return {
              ...task,
              completed: newCompletedStatus,
              isCompleted: newCompletedStatus,
              completedAt: newCompletedStatus ? new Date() : undefined,
              updatedAt: new Date()
            };
          }
          return task;
        })
      );
      
      return true;
    } catch (error) {
      console.error('Error toggling task status:', error);
      
      // Try UI update anyway
      const task = tasks.find(t => t.id === id);
      if (!task) return false;
      
      const newCompletedStatus = !task.completed;
      
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === id) {
            return {
              ...task,
              completed: newCompletedStatus,
              isCompleted: newCompletedStatus,
              completedAt: newCompletedStatus ? new Date() : undefined,
              updatedAt: new Date()
            };
          }
          return task;
        })
      );
      
      return false;
    }
  };

  // Provide context values
  const contextValue = {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    toggleCompleted
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};

// Hook for easy usage
export const useTasks = () => useContext(TaskContext);