import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const apiClient = axios.create({
  baseURL: 'http://localhost:5000', // API sunucusunun URL'si
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// İstek interceptor'ı
apiClient.interceptors.request.use(
  async (config) => {
    // İsteğe token ekle
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıt interceptor'ı
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      // Sunucu yanıtı ile dönen hata
      switch (error.response.status) {
        case 401:
          // Oturum sonlandırma işlemleri
          await AsyncStorage.removeItem('token');
          // Giriş sayfasına yönlendir
          break;
        case 403:
          // Yetkisiz erişim
          break;
        case 404:
          // Kaynak bulunamadı
          break;
        case 500:
          // Sunucu hatası
          break;
      }
    } else if (error.request) {
      // İstek yapıldı ama yanıt alınamadı
      console.error('Network error:', error.request);
    } else {
      // İstek oluşturulurken hata oluştu
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
); 