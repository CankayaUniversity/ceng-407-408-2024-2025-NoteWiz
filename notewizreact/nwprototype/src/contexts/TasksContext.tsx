// src/contexts/TasksContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
<<<<<<< HEAD
import { tasksService } from '../services/newApi';
import { useAuth } from './AuthContext';

// Task type definition
export interface Task {
  id: number;
=======
import taskService, { Task as TaskType, CreateTaskDto } from '../services/taskService';
import { useAuth } from './AuthContext';
import { offlineTaskStorage } from '../services/offlineTaskStorage';
import NetInfo from '@react-native-community/netinfo';

// Task type definition
export interface Task {
  id: string;
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
  title: string;
  description: string;
  isCompleted: boolean;
  dueDate?: string;
<<<<<<< HEAD
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
=======
  userId: string;
  createdAt: string;
  updatedAt: string;
  categoryId?: string;
  priority?: 'low' | 'medium' | 'high';
  reminder?: string;
}

interface TasksContextType {
  tasks: TaskType[];
  isLoading: boolean;
  addTask: (taskData: Partial<TaskType>) => Promise<TaskType>;
  updateTask: (id: string, taskData: Partial<TaskType>) => Promise<TaskType | undefined>;
  deleteTask: (id: string) => Promise<boolean>;
  completeTask: (id: string) => Promise<boolean>;
  syncOfflineTasks: () => Promise<void>;
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
}

// Create context
const TasksContext = createContext<TasksContextType>({
  tasks: [],
  isLoading: false,
  addTask: async () => null as any,
  updateTask: async () => null as any,
  deleteTask: async () => false,
  completeTask: async () => false,
<<<<<<< HEAD
});

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
=======
  syncOfflineTasks: async () => {},
});

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchTasks();
    } else if (!isAuthenticated && !authLoading) {
      setTasks([]);
    }
  }, [isAuthenticated, authLoading]);

<<<<<<< HEAD
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await tasksService.getTasks();
      console.log('Fetched tasks:', data);
      setTasks(data);
=======
  // Otomatik sync: bağlantı online olduğunda tetiklenir
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        console.log('[TASK][SYNC] Otomatik sync tetiklendi (bağlantı online oldu).');
        syncOfflineTasks();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await taskService.getTasks();
      setTasks(data);
      await offlineTaskStorage.saveTasks(data);
      console.log('[TASK][CACHE] fetchTasks: Cache güncellendi.');
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
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
=======
  const priorityMap: Record<string, number> = { low: 3, medium: 2, high: 1 };

  const addTask = async (taskData: Partial<TaskType>): Promise<TaskType> => {
    if (!isAuthenticated) return null as any;
    if (!taskData.title || !taskData.description) {
      throw new Error('Başlık ve açıklama zorunludur.');
    }
    try {
      const apiTaskData: CreateTaskDto = {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        priority: priorityMap[taskData.priority as string] ?? 3,
        categoryId: taskData.categoryId,
        isCompleted: taskData.isCompleted ?? false,
        reminder: (taskData as any).reminder,
      };
      const createdTask = await taskService.createTask(apiTaskData);
      if ((createdTask as any).errors) {
        throw new Error((createdTask as any).title || 'API Hatası');
      }
      setTasks(prevTasks => {
        const updated = [...prevTasks, createdTask];
        offlineTaskStorage.saveTasks(updated);
        console.log('[TASK][CACHE] addTask: Cache güncellendi.');
        return updated;
      });
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
      return createdTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

<<<<<<< HEAD
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
=======
  const updateTask = async (id: string, taskData: Partial<TaskType>): Promise<TaskType | undefined> => {
    if (!isAuthenticated) return null as any;
    if (taskData.title !== undefined && !taskData.title) {
      throw new Error('Başlık zorunludur.');
    }
    if (taskData.description !== undefined && !taskData.description) {
      throw new Error('Açıklama zorunludur.');
    }
    try {
      const apiTaskData: Partial<CreateTaskDto> = {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        priority: priorityMap[taskData.priority as string] ?? 3,
        categoryId: taskData.categoryId,
        isCompleted: taskData.isCompleted,
        reminder: (taskData as any).reminder,
      };
      const updatedTask = await taskService.updateTask(id, apiTaskData);
      if (!updatedTask || (updatedTask as any).errors) {
        throw new Error((updatedTask as any)?.title || 'API Hatası');
      }
      setTasks(prevTasks => {
        const updated = prevTasks.map(task => task.id === id ? updatedTask : task);
        offlineTaskStorage.saveTasks(updated);
        console.log('[TASK][CACHE] updateTask: Cache güncellendi.');
        return updated;
      });
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

<<<<<<< HEAD
  const deleteTask = async (id: number): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      await tasksService.deleteTask(id);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
=======
  const deleteTask = async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    try {
      await taskService.deleteTask(id);
      setTasks(prevTasks => {
        const updated = prevTasks.filter(task => task.id !== id);
        offlineTaskStorage.saveTasks(updated);
        console.log('[TASK][CACHE] deleteTask: Cache güncellendi.');
        return updated;
      });
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  };

<<<<<<< HEAD
  const completeTask = async (id: number): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      const updatedTask = await tasksService.completeTask(id);
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === id ? updatedTask : task)
      );
=======
  const completeTask = async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return false;
      const updatedTask = await taskService.updateTask(id, { isCompleted: !task.isCompleted });
      if (!updatedTask) return false;
      setTasks(prevTasks => {
        const updated = prevTasks.map(t => t.id === id ? updatedTask : t);
        offlineTaskStorage.saveTasks(updated);
        console.log('[TASK][CACHE] completeTask: Cache güncellendi.');
        return updated;
      });
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      return false;
    }
  };

<<<<<<< HEAD
=======
  // SYNC OFFLINE TASKS
  let isSyncing = false;
  const syncOfflineTasks = async () => {
    if (isSyncing) {
      console.log('[TASK][SYNC][SKIP] Zaten bir sync işlemi devam ediyor.');
      return;
    }
    isSyncing = true;
    console.log('[TASK][SYNC] Sync başlatıldı.');
    try {
      let pending = await offlineTaskStorage.getPendingSync();
      if (!pending.length) {
        console.log('[TASK][SYNC] Pending queue boş.');
        return;
      }
      // Aynı ID'li create işlemlerini filtrele (sadece ilkini bırak)
      const seenCreateIds = new Set();
      pending = pending.filter((action: any) => {
        if (action.action === 'create') {
          if (seenCreateIds.has(action.data.id)) {
            console.log('[TASK][SYNC][FILTER] Duplicate create action atıldı:', action.data.id);
            return false;
          }
          seenCreateIds.add(action.data.id);
        }
        return true;
      });
      let tasksCache = await offlineTaskStorage.getTasks();
      let updatedPending: any[] = [];
      const tempIdToRealId: Record<string, string> = {};
      let tasksToRemove: string[] = [];
      const processedCreateIds: Set<string> = new Set();
      const processedActions: Set<string> = new Set();

      for (const action of pending) {
        const actionKey = `${action.action}_${action.data?.id}`;
        if (processedActions.has(actionKey)) {
          console.log('[TASK][SYNC][SKIP] Zaten işlendi:', actionKey);
          continue;
        }
        processedActions.add(actionKey);
        try {
          switch (action.action) {
            case 'create': {
              if (processedCreateIds.has(action.data.id)) {
                console.log('[TASK][SYNC][SKIP] Aynı geçici ID ile ikinci create:', action.data.id);
                break;
              }
              processedCreateIds.add(action.data.id);
              const response = await taskService.createTask(action.data);
              const createdTask = response;
              const taskIndex = tasksCache.findIndex((t: TaskType) => t.id === action.data.id);
              if (taskIndex !== -1) {
                const oldId = tasksCache[taskIndex].id;
                tasksCache[taskIndex] = {
                  ...tasksCache[taskIndex],
                  ...createdTask,
                };
                tempIdToRealId[oldId] = createdTask.id.toString();
                tasksToRemove.push(oldId);
                console.log('[TASK][SYNC] create senkronize edildi:', createdTask.id, 'Geçici ID:', oldId);
              }
              break;
            }
            case 'update': {
              let updateId = action.data.id;
              if (tempIdToRealId[updateId]) {
                updateId = tempIdToRealId[updateId];
              }
              const response = await taskService.updateTask(updateId, action.data);
              tasksCache = tasksCache.map((t: TaskType) => t.id === updateId ? response : t);
              console.log('[TASK][SYNC] update senkronize edildi:', updateId);
              break;
            }
            case 'delete': {
              let deleteId = action.data.id;
              if (tempIdToRealId[deleteId]) {
                deleteId = tempIdToRealId[deleteId];
              }
              await taskService.deleteTask(deleteId);
              tasksCache = tasksCache.filter((t: TaskType) => t.id !== deleteId);
              console.log('[TASK][SYNC] delete senkronize edildi:', deleteId);
              break;
            }
          }
        } catch (err) {
          // Eğer create ise ve zaten işlendiyse, updatedPending'e ekleme
          if (!(action.action === 'create' && processedCreateIds.has(action.data.id))) {
            updatedPending.push(action);
          }
          console.error('[TASK][SYNC][ERROR] Sync işlemi başarısız:', action, err);
        }
      }
      // Eski geçici ID'li task'ları sil
      if (tasksToRemove.length > 0) {
        tasksCache = tasksCache.filter((t: TaskType) => !tasksToRemove.includes(t.id));
      }
      // Localdeki task'ları güncelle
      await offlineTaskStorage.saveTasks(tasksCache);
      // Sadece başarısız olanları pending'e yaz
      await offlineTaskStorage.clearPendingSync();
      if (updatedPending.length > 0) {
        await offlineTaskStorage.savePendingSync('bulk', updatedPending);
      }
      setTasks(tasksCache);
      console.log('[TASK][SYNC] Sync tamamlandı ve cache güncellendi.');
    } catch (err) {
      console.error('[TASK][SYNC][ERROR] Genel sync hatası:', err);
    } finally {
      isSyncing = false;
    }
  };

>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
  const contextValue = {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
<<<<<<< HEAD
    completeTask
=======
    completeTask,
    syncOfflineTasks
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
  };

  return (
    <TasksContext.Provider value={contextValue}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => useContext(TasksContext); 