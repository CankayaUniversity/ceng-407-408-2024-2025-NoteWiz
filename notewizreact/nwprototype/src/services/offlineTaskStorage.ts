import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_TASKS_KEY = '@offline_tasks';
const PENDING_TASK_SYNC_KEY = '@pending_task_sync';

export const offlineTaskStorage = {
  // Taskları kaydet
  saveTasks: async (tasks: any[]) => {
    try {
      await AsyncStorage.setItem(OFFLINE_TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  },

  // Taskları getir
  getTasks: async () => {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_TASKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  },

  // Senkronizasyon bekleyen işlemleri kaydet
  savePendingSync: async (action: string, data: any) => {
    try {
      const pending = await AsyncStorage.getItem(PENDING_TASK_SYNC_KEY);
      let pendingActions = pending ? JSON.parse(pending) : [];
      // Aynı action ve id'ye sahip kayıt var mı kontrol et
      const exists = pendingActions.some((item: any) => item.action === action && item.data?.id === data?.id);
      if (exists) {
        console.log('[PENDING][SKIP] Zaten var:', action, data?.id);
        return;
      }
      pendingActions.push({ action, data, timestamp: new Date().toISOString() });
      await AsyncStorage.setItem(PENDING_TASK_SYNC_KEY, JSON.stringify(pendingActions));
      console.log('[PENDING][AFTER]', JSON.stringify(pendingActions));
    } catch (error) {
      console.error('Error saving pending task sync:', error);
    }
  },

  // Senkronizasyon bekleyen işlemleri getir
  getPendingSync: async () => {
    try {
      const data = await AsyncStorage.getItem(PENDING_TASK_SYNC_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting pending task sync:', error);
      return [];
    }
  },

  // Senkronizasyon bekleyen işlemleri temizle
  clearPendingSync: async () => {
    try {
      await AsyncStorage.removeItem(PENDING_TASK_SYNC_KEY);
    } catch (error) {
      console.error('Error clearing pending task sync:', error);
    }
  }
}; 