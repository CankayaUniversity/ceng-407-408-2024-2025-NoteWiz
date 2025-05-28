// src/services/openai.ts
import { apiClient } from './newApi';
import { Alert, Platform } from 'react-native';
import { API_URL } from '../config/api';

const API_BASE_URL = `${API_URL}/ai`;

/**
 * Genel AI fonksiyonu: prompt gönderir
 */
export const askAI = async (prompt: string) => {
  console.log('askAI çağrıldı:', prompt);
  try {
    if (!prompt?.trim()) {
      throw new Error('Prompt boş olamaz');
    }

    const response = await apiClient.post(`${API_BASE_URL}/ask`, { 
      Question: prompt.trim() 
    });

    console.log('askAI response:', response.data);
    
    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data.answer;
  } catch (error: any) {
    console.error('askAI error:', error);
    
    // Kullanıcıya hata mesajını göster
    const errorMessage = error.response?.data?.error || error.message || 'Bir hata oluştu';
    Alert.alert('Hata', errorMessage);
    
    throw error;
  }
};

/**
 * Metin özeti almak için
 */
export const getSummary = async (text: string) => {
  if (!text?.trim()) {
    throw new Error('Özetlenecek metin boş olamaz');
  }
  return askAI(`Lütfen şu metni özetle: "${text.trim()}"`);
};

/**
 * Metni yeniden yazmak için
 */
export const rewriteText = async (text: string) => {
  if (!text?.trim()) {
    throw new Error('Yeniden yazılacak metin boş olamaz');
  }
  return askAI(`Lütfen bu metni daha iyi bir şekilde yeniden yaz: ${text.trim()}`);
};
