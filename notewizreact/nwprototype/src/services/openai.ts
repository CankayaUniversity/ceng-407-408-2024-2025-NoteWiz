// src/services/openai.ts
import { apiClient } from './newApi';
import { Alert } from 'react-native';

const API_BASE_URL = 'http://10.0.2.2:5263/api/ai'; // Adjust if needed

/**
 * Genel AI fonksiyonu: prompt gönderir
 */
export const askAI = async (prompt: string) => {
  console.log('askAI çağrıldı:', prompt);
  try {
    const response = await apiClient.post(`${API_BASE_URL}/ask`, { Question: prompt });
    console.log('askAI response:', response.data);
    return response.data.answer;
  } catch (error) {
    console.error('askAI error:', error);
    throw error;
  }
};

/**
 * Metin özeti almak için
 */
export const getSummary = async (text: string) => {
  return askAI(`Lütfen şu metni özetle: \"${text}\"`);
};

/**
 * Metni yeniden yazmak için
 */
export const rewriteText = async (text: string) => {
  return askAI(`Lütfen bu metni daha iyi bir şekilde yeniden yaz: ${text}`);
};
