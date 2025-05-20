import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { noteService } from '../services/noteService';

export const useNetworkSync = () => {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        // İnternet bağlantısı geldiğinde senkronizasyonu başlat
        noteService.syncOfflineData(() => {}).catch(error => {
          console.error('Sync error:', error);
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
}; 