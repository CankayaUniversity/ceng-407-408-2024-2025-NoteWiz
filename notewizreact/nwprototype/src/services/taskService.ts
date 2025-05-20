import { apiClient } from './newApi';
<<<<<<< HEAD
=======
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { offlineTaskStorage } from './offlineTaskStorage';
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c

export interface Task {
  id: string;
  userId: string;
  title: string;
<<<<<<< HEAD
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  categoryId?: string;
  completed: boolean;
=======
  description: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  categoryId?: string;
  isCompleted: boolean;
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
  reminder?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
<<<<<<< HEAD
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  categoryId?: string;
  completed?: boolean;
=======
  description: string;
  dueDate?: string;
  priority?: number;
  categoryId?: string;
  isCompleted?: boolean;
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
  reminder?: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {}

class TaskService {
  async getTasks(): Promise<Task[]> {
<<<<<<< HEAD
    const response = await apiClient.get<Task[]>('/tasks');
    return response.data;
  }

  async getTaskById(id: string): Promise<Task> {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  }

  async createTask(taskData: CreateTaskDto): Promise<Task> {
    const response = await apiClient.post<Task>('/tasks', taskData);
    return response.data;
  }

  async updateTask(id: string, taskData: UpdateTaskDto): Promise<Task> {
    const response = await apiClient.put<Task>(`/tasks/${id}`, taskData);
    return response.data;
  }

  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
=======
    const isConnected = await NetInfo.fetch().then((state: NetInfoState) => state.isConnected);
    if (isConnected) {
      const response = await apiClient.get<Task[]>('/tasks');
      return response.data;
    } else {
      return await offlineTaskStorage.getTasks();
    }
  }

  async getTaskById(id: string): Promise<Task> {
    const isConnected = await NetInfo.fetch().then((state: NetInfoState) => state.isConnected);
    if (isConnected) {
      const response = await apiClient.get<Task>(`/tasks/${id}`);
      return response.data;
    } else {
      const tasks = await offlineTaskStorage.getTasks();
      return tasks.find((t: Task) => t.id === id);
    }
  }

  async createTask(taskData: CreateTaskDto): Promise<Task> {
    const isConnected = await NetInfo.fetch().then((state: NetInfoState) => state.isConnected);
    console.log('[TASK][DEBUG] createTask isConnected:', isConnected);
    if (isConnected) {
      try {
        const response = await apiClient.post<Task>('/tasks', taskData);
        console.log('[TASK][DEBUG] API response:', response);
        const data = response.data;
        const result = { ...data, id: data.id?.toString() ?? '', isCompleted: (data as any).isCompleted ?? (data as any).completed ?? false };
        console.log('[TASK][DEBUG] API createdTask:', result);
        return result;
      } catch (err) {
        const error = err as any;
        console.error('[TASK][DEBUG] API createTask error:', error);
        if (error.response && error.response.data) {
          return error.response.data;
        }
        throw error;
      }
    } else {
      // Offline modda task oluştur
      const tasks = await offlineTaskStorage.getTasks();
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        userId: '',
        isCompleted: taskData.isCompleted ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Task;
      tasks.push(newTask);
      await offlineTaskStorage.saveTasks(tasks);
      await offlineTaskStorage.savePendingSync('create', newTask);
      console.log('[TASK][DEBUG] Offline createdTask:', newTask);
      return newTask;
    }
  }

  async updateTask(id: string, taskData: UpdateTaskDto): Promise<Task | undefined> {
    const isConnected = await NetInfo.fetch().then((state: NetInfoState) => state.isConnected);
    if (isConnected) {
      try {
        const response = await apiClient.put<Task>(`/tasks/${id}`, taskData);
        const data = response.data;
        return { ...data, id: data.id?.toString() ?? '', isCompleted: (data as any).isCompleted ?? (data as any).completed ?? false };
      } catch (err) {
        const error = err as any;
        if (error.response && error.response.data) {
          return error.response.data;
        }
        throw error;
      }
    } else {
      // Offline modda task güncelle
      const tasks = await offlineTaskStorage.getTasks();
      const taskIndex = tasks.findIndex((t: Task) => t.id === id);
      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          ...taskData,
          updatedAt: new Date().toISOString(),
        };
        await offlineTaskStorage.saveTasks(tasks);
        await offlineTaskStorage.savePendingSync('update', tasks[taskIndex]);
        return tasks[taskIndex];
      }
      return undefined;
    }
  }

  async deleteTask(id: string): Promise<void> {
    const isConnected = await NetInfo.fetch().then((state: NetInfoState) => state.isConnected);
    if (isConnected) {
      await apiClient.delete(`/tasks/${id}`);
    } else {
      // Offline modda task sil
      const tasks = await offlineTaskStorage.getTasks();
      const taskIndex = tasks.findIndex((t: Task) => t.id === id);
      if (taskIndex !== -1) {
        const deletedTask = tasks[taskIndex];
        tasks.splice(taskIndex, 1);
        await offlineTaskStorage.saveTasks(tasks);
        await offlineTaskStorage.savePendingSync('delete', deletedTask);
      }
    }
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
  }
}

export const taskService = new TaskService();
export default taskService; 