import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_USER_KEY = '@offline_user';
const OFFLINE_NOTES_KEY = '@offline_notes';
const PENDING_SYNC_KEY = '@pending_sync';

export const offlineStorage = {
  // Kullanıcı bilgilerini kaydet
  saveUserData: async (userData: any) => {
    try {
      await AsyncStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  },

  // Kullanıcı bilgilerini getir
  getUserData: async () => {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  // Notları kaydet
  saveNotes: async (notes: any[]) => {
    try {
      await AsyncStorage.setItem(OFFLINE_NOTES_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  },

  // Notları getir
  getNotes: async () => {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_NOTES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  },

  // Senkronizasyon bekleyen işlemleri kaydet
  savePendingSync: async (action: string, data: any) => {
    try {
      const pending = await AsyncStorage.getItem(PENDING_SYNC_KEY);
      let pendingActions = pending ? JSON.parse(pending) : [];
      console.log('[PENDING][BEFORE]', JSON.stringify(pendingActions));
      // Aynı action ve id'ye sahip kayıt var mı kontrol et
      const exists = pendingActions.some((item: any) => item.action === action && item.data?.id === data?.id);
      if (exists) {
        console.log('[PENDING][SKIP] Zaten var:', action, data?.id);
        return;
      }
      pendingActions.push({ action, data, timestamp: new Date().toISOString() });
      await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pendingActions));
      console.log('[PENDING][AFTER]', JSON.stringify(pendingActions));
    } catch (error) {
      console.error('Error saving pending sync:', error);
    }
  },

  // Senkronizasyon bekleyen işlemleri getir
  getPendingSync: async () => {
    try {
      const data = await AsyncStorage.getItem(PENDING_SYNC_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting pending sync:', error);
      return [];
    }
  },

  // Senkronizasyon bekleyen işlemleri temizle
  clearPendingSync: async () => {
    try {
      await AsyncStorage.removeItem(PENDING_SYNC_KEY);
    } catch (error) {
      console.error('Error clearing pending sync:', error);
    }
  }
}; 