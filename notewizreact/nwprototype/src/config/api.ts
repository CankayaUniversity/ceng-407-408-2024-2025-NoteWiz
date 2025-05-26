import { Platform } from 'react-native';

// API URL'sini buradan yönetiyoruz
export const API_URL = __DEV__ 
  ? Platform.OS === 'android' 
    ? Platform.isTV || Platform.constants.Brand === 'samsung' // Check for physical device
      ? 'http://192.168.1.59:5263/api'  // Fiziksel Android cihaz için
      : 'http://10.0.2.2:5263/api'      // Android Emulator için
    : 'http://localhost:5263/api'      // iOS için
  : 'https://api.notewiz.com/api';

// CORS ayarları için headers
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}; 