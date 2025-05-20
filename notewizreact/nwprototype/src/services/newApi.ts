import axios, { AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import EventEmitter from '../utils/EventEmitter';

// Base URL configuration
let API_BASE_URL = 'http://localhost:5263/api';

if (Platform.OS === 'android') {
  if (__DEV__) {
    API_BASE_URL = 'http://10.0.2.2:5263/api';
  } else {
    API_BASE_URL = 'https://api.notewiz.com/api';
  }
} else if (Platform.OS === 'ios') {
  if (__DEV__) {
    API_BASE_URL = 'http://localhost:5263/api';
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
<<<<<<< HEAD
      config.headers.Authorization = `Bearer ${token}`;
=======
      console.log('[API] Adding token to request:', token.substring(0, 20) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('[API] No token found for request');
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
    }
    return config;
  },
  (error) => {
<<<<<<< HEAD
    console.error('Request error:', error);
=======
    console.error('[API] Request error:', error);
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
<<<<<<< HEAD
  (response) => response,
  async (error) => {
    console.error('Response error:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      EventEmitter.emit('unauthorized');
=======
  (response) => {
    console.log('[API] Response success:', response.config.url);
    return response;
  },
  async (error) => {
    console.error('[API] Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });

    // Sadece login ve register endpointleri hariç 401'de logout
    const url = error.config?.url || '';
    if (
      error.response?.status === 401 &&
      !url.includes('/Users/login') &&
      !url.includes('/Users/register')
    ) {
      console.log('[API] 401 Unauthorized, checking token...');
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        console.log('[API] Token exists but request failed, removing token');
        await AsyncStorage.removeItem('userToken');
        EventEmitter.emit('unauthorized');
      }
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
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

<<<<<<< HEAD
  getFolders: async () => {
    try {
      const response = await apiClient.get('/Notes?isFolder=true');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

=======
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
  getNote: async (id: number) => {
    try {
      const response = await apiClient.get(`/Notes/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

<<<<<<< HEAD
  createNote: async (note: { title: string; content: string; categoryId?: number }) => {
=======
  createNote: async (note: { title: string; content: string }) => {
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
    try {
      const response = await apiClient.post('/Notes', note);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

<<<<<<< HEAD
  updateNote: async (
    id: number,
    note: {
      title: string;
      content: string;
      color?: string;
      isPinned?: boolean;
      folderId?: number | null;
      tags?: string[];
      isPrivate?: boolean;
      categoryId?: number;
    }
  ) => {
=======
  updateNote: async (id: number, note: { title: string; content: string }) => {
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
    try {
      console.log('[apiClient.put] Making request to:', `/Notes/${id}`, 'with data:', note);
      const response = await apiClient.put(`/Notes/${id}`, note);
      console.log('[apiClient.put] Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[apiClient.put] Error:', error);
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
<<<<<<< HEAD
  },

  getFolderNotes: async (folderId: number) => {
    try {
      const response = await apiClient.get(`/Notes?folderId=${folderId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
=======
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
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