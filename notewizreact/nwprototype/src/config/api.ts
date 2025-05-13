// API URL'sini buradan yönetiyoruz
export const API_URL = __DEV__ 
  ? 'http://10.0.2.2:5263'  // Android Emulator için
  : 'https://api.notewiz.com'; // Production URL

// CORS ayarları için headers
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}; 