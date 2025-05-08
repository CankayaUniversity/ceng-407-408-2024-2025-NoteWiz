import axios, { AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import EventEmitter from '../utils/EventEmitter';

// Base URL configuration
let API_BASE_URL = 'http://localhost:5263/api';

if (Platform.OS === 'android') {
  if (__DEV__) {
    // Emülatör için
    if (Platform.constants.Fingerprint === 'generic') {
      API_BASE_URL = 'http://10.0.2.2:5263/api';
    } else {
      // Fiziksel cihaz için bilgisayarın IP adresini kullan
      API_BASE_URL = 'http://192.168.1.24:5263/api';
    }
  } else {
    API_BASE_URL = 'https://api.notewiz.com/api';
  }
} else if (Platform.OS === 'ios') {
  if (__DEV__) {
    API_BASE_URL = 'http://192.168.1.24:5263/api';
  } else {
    API_BASE_URL = 'https://api.notewiz.com/api';
  }
}

// Create axios instance
const axiosConfig: AxiosRequestConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000,
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Accept all status codes less than 500
  }
};

export const apiClient = axios.create(axiosConfig);

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('Response error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      EventEmitter.emit('unauthorized');
    }
    return Promise.reject(error);
  }
);

// Error handling utility
const handleApiError = (error: any) => {
  if (error.response) {
    console.error('API Error:', error.response.data);
    if (error.response.status === 401) {
      AsyncStorage.removeItem('userToken');
      EventEmitter.emit('unauthorized');
    }
  } else if (error.request) {
    console.error('API Request Error:', error.request);
  } else {
    console.error('API Setup Error:', error.message);
  }
  throw error;
};

// Types
interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
}

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

interface Task {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  dueDate?: string;
  userId: number;
}

// Auth Service
export const authService = {
  register: async (userData: { username: string; email: string; password: string; fullName: string }) => {
    try {
      const response = await apiClient.post('/Users/register', userData);
      if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/Users/login', { email, password });
      if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      return true;
    } catch (error) {
      handleApiError(error);
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/Users/me');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};

// Notes Service
export const notesService = {
  getNotes: async () => {
    try {
      const response = await apiClient.get('/Notes');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getNote: async (id: number) => {
    try {
      const response = await apiClient.get(`/Notes/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  createNote: async (note: { title: string; content: string }) => {
    try {
      const response = await apiClient.post('/Notes', note);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  updateNote: async (id: number, note: { title: string; content: string }) => {
    try {
      const response = await apiClient.put(`/Notes/${id}`, note);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  deleteNote: async (id: number) => {
    try {
      await apiClient.delete(`/Notes/${id}`);
      return true;
    } catch (error) {
      handleApiError(error);
    }
  },

  shareNote: async (id: number, shareData: { email: string; canEdit: boolean }) => {
    try {
      const response = await apiClient.post(`/Notes/${id}/share`, shareData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getSharedNotes: async () => {
    try {
      const response = await apiClient.get('/Notes/shared');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};

// Tasks Service
export const tasksService = {
  getTasks: async () => {
    try {
      const response = await apiClient.get('/Tasks');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getTask: async (id: number) => {
    try {
      const response = await apiClient.get(`/Tasks/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  createTask: async (task: { title: string; description: string; dueDate?: string }) => {
    try {
      const response = await apiClient.post('/Tasks', task);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  updateTask: async (id: number, task: { title: string; description: string; dueDate?: string }) => {
    try {
      const response = await apiClient.put(`/Tasks/${id}`, task);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  deleteTask: async (id: number) => {
    try {
      await apiClient.delete(`/Tasks/${id}`);
      return true;
    } catch (error) {
      handleApiError(error);
    }
  },

  completeTask: async (id: number) => {
    try {
      const response = await apiClient.put(`/Tasks/${id}/complete`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};

// AI Service
export const aiService = {
  chat: async (message: string) => {
    try {
      const response = await apiClient.post('/AI/chat', { message });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getNoteSuggestions: async (noteId: number, request: { message: string }) => {
    try {
      const response = await apiClient.post(`/AI/notes/${noteId}/suggest`, request);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};

// Friendship Service
export const friendshipService = {
  getFriends: async () => {
    try {
      const response = await apiClient.get('/Friendship');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  removeFriend: async (friendId: number) => {
    try {
      await apiClient.delete(`/Friendship/${friendId}`);
      return true;
    } catch (error) {
      handleApiError(error);
    }
  }
}; 