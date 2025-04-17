// src/services/openai.ts
import axios from 'axios';
import { OPENAI_API_KEY } from '@env';

/** 
 * Metin özeti almak için 
 */
export const getSummary = async (text: string) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that summarizes text.' },
          { role: 'user', content: `Lütfen şu metni özetle: "${text}"` },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    const aiMessage = response.data.choices[0].message?.content;
    return aiMessage; // null olabilir, string olabilir
  } catch (error) {
    console.error('getSummary error:', error);
    throw error;
  }
};

/**
 * Örnek: farklı bir fonksiyon, 'düzelt' veya 'yeniden yaz' gibi
 */
export const rewriteText = async (text: string) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Rewrite or rephrase the user text in a better way.' },
          { role: 'user', content: text },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    const aiMessage = response.data.choices[0].message?.content;
    return aiMessage;
  } catch (error) {
    console.error('rewriteText error:', error);
    throw error;
  }
};
