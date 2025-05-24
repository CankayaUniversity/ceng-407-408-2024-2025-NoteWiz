import { apiClient } from './newApi';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 1 | 2 | 3;
  categoryId?: string;
  isCompleted: boolean;
  reminder?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  categoryId?: string;
  isCompleted?: boolean;
  reminder?: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {}

class TaskService {
  async getTasks(): Promise<Task[]> {
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
  }
}

export const taskService = new TaskService();
export default taskService; 