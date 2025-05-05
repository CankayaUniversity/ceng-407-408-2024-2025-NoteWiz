// src/services/api.ts - Sahte veri entegrasyonu
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import EventEmitter from '../utils/EventEmitter';

let API_BASE_URL = 'http://localhost:5263/api';

if (Platform.OS === 'android') {
  if (__DEV__) {
    // Android Emülatör (Development)
    API_BASE_URL = 'http://10.0.2.2:5263/api';
  } else {
    // Gerçek Android cihazı (Production)
    API_BASE_URL = 'https://api.notewiz.com/api';
  }
} else if (Platform.OS === 'ios') {
  if (__DEV__) {
    // iOS Simulator (Development)
    API_BASE_URL = 'http://localhost:5263/api';
  } else {
    // Gerçek iOS cihazı (Production)
    API_BASE_URL = 'https://api.notewiz.com/api';
  }
}

// Debug için URL'i logla
console.log('Platform:', Platform.OS);
console.log('Development mode:', __DEV__);
console.log('API URL:', API_BASE_URL);

// Axios instance oluştur
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 saniye timeout
});

// Request interceptor - token ekleme
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - token yenileme ve hata yönetimi
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token geçersiz veya süresi dolmuş
      await AsyncStorage.removeItem('userToken');
      // Kullanıcıyı login ekranına yönlendir
      // navigation.navigate('Auth');
    }
    return Promise.reject(error);
  }
);

const handleApiError = (error: any) => {
  if (error.response) {
    // Server tarafından dönen hata
    console.error('API Error:', error.response.data);
    if (error.response.status === 401) {
      // Token geçersiz, kullanıcıyı logout yap
      AsyncStorage.removeItem('userToken');
      // AuthContext'i güncellemek için event yayınla
      EventEmitter.emit('unauthorized');
    }
  } else if (error.request) {
    // İstek yapıldı ama cevap alınamadı
    console.error('API Request Error:', error.request);
  } else {
    // İstek oluşturulurken hata oluştu
    console.error('API Setup Error:', error.message);
  }
  throw error;
};

// Not servisi
export const notesService = {
  // Tüm notları getir
  getNotes: async () => {
    try {
      const response = await apiClient.get('/notes');
      return response.data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },

  // Yeni not oluştur
  createNote: async (note: any) => {
    try {
      const response = await apiClient.post('/notes', note);
      return response.data;
    } catch (error) {
      console.error('Error creating note:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  // Not güncelle
  updateNote: async (id: number | string, note: any) => {
    try {
      const response = await apiClient.put(`/notes/${id}`, note);
      return response.data;
    } catch (error) {
      console.error(`Error updating note with id ${id}:`, error);
      throw error;
    }
  },

  // Not sil
  deleteNote: async (id: number | string) => {
    try {
      await apiClient.delete(`/notes/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting note with id ${id}:`, error);
      throw error;
    }
  },

  // Not paylaş
  shareNote: async (id: number, shareData: { email: string, canEdit: boolean }) => {
    try {
      await apiClient.post(`/notes/${id}/share`, shareData);
      return true;
    } catch (error) {
      console.error(`Error sharing note with id ${id}:`, error);
      throw error;
    }
  },

  // Paylaşılan notları getir
  getSharedNotes: async () => {
    try {
      const response = await apiClient.get('/notes/shared');
      return response.data;
    } catch (error) {
      console.error('Error fetching shared notes:', error);
      throw error;
    }
  },

  generateCover: async (title: string, content: string) => {
    const response = await apiClient.post('/notes/generate-cover', {
      title,
      content
    });
    return response.data;
  },
};

// Kullanıcı servisi
export const authService = {
  // Kayıt ol
  register: async (userData: { username: string, email: string, fullName: string, password: string }) => {
    try {
      const response = await apiClient.post('/users/register', userData);
      if (response.data && response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  // Giriş yap
  login: async (email: string, password: string) => {
    try {
      // E-posta formatını kontrol et
      if (!email.includes('@')) {
        throw new Error('Geçersiz e-posta formatı');
      }

      // Şifre uzunluğunu kontrol et
      if (password.length < 6) {
        throw new Error('Şifre en az 6 karakter olmalıdır');
      }

      const loginData = {
        email: email.trim().toLowerCase(),
        password: password
      };

      console.log('Login request to:', `${API_BASE_URL}/users/login`);
      console.log('Login data:', { email: loginData.email, password: '***' });

      const response = await apiClient.post('/users/login', loginData);
      
      if (!response.data || !response.data.token) {
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }

      const token = response.data.token;
      await AsyncStorage.setItem('userToken', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('E-posta veya şifre hatalı');
        } else if (error.response?.status === 400) {
          throw new Error(error.response.data || 'Geçersiz giriş bilgileri');
        } else if (!error.response) {
          throw new Error('Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.');
        }
      }
      throw error;
    }
  },

  // Çıkış yap
  logout: async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      console.log('Logout successful, token removed');
      return true;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  // Mevcut kullanıcı bilgilerini getir
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }
};

// Görev servisi
export const tasksService = {
  // Tüm görevleri getir
  getTasks: async () => {
    try {
      const response = await apiClient.get('/tasks');
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Tek bir görevi getir
  getTask: async (id: number) => {
    try {
      const response = await apiClient.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching task with id ${id}:`, error);
      throw error;
    }
  },

  // Yeni görev oluştur
  createTask: async (task: any) => {
    try {
      const response = await apiClient.post('/tasks', task);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Görev güncelle
  updateTask: async (id: number, task: any) => {
    try {
      const response = await apiClient.put(`/tasks/${id}`, task);
      return response.data;
    } catch (error) {
      console.error(`Error updating task with id ${id}:`, error);
      throw error;
    }
  },

  // Görev tamamlandı olarak işaretle
  completeTask: async (id: number) => {
    try {
      const response = await apiClient.put(`/tasks/${id}/complete`);
      return response.data;
    } catch (error) {
      console.error(`Error completing task with id ${id}:`, error);
      throw error;
    }
  },

  // Görev sil
  deleteTask: async (id: number) => {
    try {
      await apiClient.delete(`/tasks/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting task with id ${id}:`, error);
      throw error;
    }
  }
};

// Kategori servisi
export const categoriesService = {
  getCategories: async (userId: number) => {
    try {
      const response = await apiClient.get(`/categories?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
  
  addCategory: async (category: { name: string; color?: string; userId: number }) => {
    try {
      const response = await apiClient.post('/categories', category);
      return response.data;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },
  
  updateCategory: async (id: number, data: { name?: string; color?: string }) => {
    try {
      const response = await apiClient.put(`/categories/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating category with id ${id}:`, error);
      throw error;
    }
  },
  
  deleteCategory: async (id: number) => {
    try {
      await apiClient.delete(`/categories/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting category with id ${id}:`, error);
      throw error;
    }
  }
};

// Notification endpoints
export const getNotifications = async (includeRead = false) => {
  try {
    const response = await apiClient.get(`/notifications?includeRead=${includeRead}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

export const getUnreadNotifications = async () => {
  try {
    const response = await apiClient.get('/notifications/unread');
    return response.data;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const response = await apiClient.get('/notifications/unread/count');
    return response.data.count;
  } catch (error) {
    handleApiError(error);
    return 0;
  }
};

export const markNotificationAsRead = async (notificationId: number) => {
  try {
    const response = await apiClient.post(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await apiClient.post('/notifications/read-all');
    return response.data.success;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

export const deleteNotification = async (notificationId: number) => {
  try {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data.success;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

export const deleteAllNotifications = async () => {
  try {
    const response = await apiClient.delete('/notifications');
    return response.data.success;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

export const API_CONFIG = {
    BASE_URL: API_BASE_URL
} as const;

export default {
  notesService,
  authService,
  tasksService,
  categoriesService,
  API_CONFIG, // API URL'i dışa aktar
  handleApiError: async (error: any) => {
    if (error.response) {
      console.error('Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    throw error;
  }
};