import { Platform } from 'react-native';

// API URL'sini buradan yönetiyoruz
export const API_URL = __DEV__ 
  ? Platform.OS === 'android' 
    ? Platform.isTV || Platform.constants.Brand === 'samsung' // Check for physical device
      ? (() => {
          console.log('Using physical device API URL');
          return 'http://192.168.147.244:5263/api';
        })()
      : (() => {
          console.log('Using Android emulator API URL');
          return 'http://10.0.2.2:5263/api';
        })()
    : (() => {
        console.log('Using iOS API URL');
        return 'http://localhost:5263/api';
      })()
  : 'https://api.notewiz.com/api';

console.log('Current API URL:', API_URL);

// CORS ayarları için headers
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}; 