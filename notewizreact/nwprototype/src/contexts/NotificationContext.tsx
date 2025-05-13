import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/newApi';
import signalRService from '../services/signalR';
import EventEmitter from '../utils/EventEmitter';
import notifee from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  noteId?: number;
  taskId?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loadNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      // Önce token kontrolü yapalım
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found, skipping notification load');
        return;
      }

      const [notificationsResponse, countResponse] = await Promise.all([
        apiClient.get('/Notifications'),
        apiClient.get('/Notifications/unread-count')
      ]);
      
      setNotifications(notificationsResponse.data);
      setUnreadCount(countResponse.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Token geçersiz veya süresi dolmuş
        console.log('Token invalid, clearing notifications');
        setNotifications([]);
        setUnreadCount(0);
      } else {
        console.error('Error loading notifications:', error);
      }
    }
  };

  const showNotification = async (title: string, body: string) => {
    try {
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      });

      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId,
          pressAction: {
            id: 'default',
          },
        },
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  useEffect(() => {
    const initializeNotifications = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        loadNotifications();
        signalRService.initializeNotificationConnection();
      }
    };

    initializeNotifications();

    // Bildirim dinleyicilerini ekle
    const notificationHandler = (notification: Notification) => {
      loadNotifications();
      showNotification(notification.title, notification.message);
    };

    const taskReminderHandler = ({ taskId, taskTitle }: { taskId: number; taskTitle: string }) => {
      loadNotifications();
      showNotification('Görev Hatırlatması', `"${taskTitle}" görevi için hatırlatma`);
    };

    const noteSharedHandler = ({ noteId, noteTitle, sharedByUsername }: { 
      noteId: number; 
      noteTitle: string; 
      sharedByUsername: string 
    }) => {
      loadNotifications();
      showNotification('Not Paylaşıldı', `${sharedByUsername} sizinle "${noteTitle}" notunu paylaştı`);
    };

    // Unauthorized event listener ekle
    const unauthorizedHandler = () => {
      setNotifications([]);
      setUnreadCount(0);
      signalRService.disconnect();
    };

    EventEmitter.on('unauthorized', unauthorizedHandler);
    EventEmitter.on('onNotification', notificationHandler);
    EventEmitter.on('onTaskReminder', taskReminderHandler);
    EventEmitter.on('onNoteShared', noteSharedHandler);

    return () => {
      signalRService.disconnect();
      EventEmitter.off('unauthorized', unauthorizedHandler);
      EventEmitter.off('onNotification', notificationHandler);
      EventEmitter.off('onTaskReminder', taskReminderHandler);
      EventEmitter.off('onNoteShared', noteSharedHandler);
    };
  }, []);

  const markAsRead = async (notificationId: number) => {
    try {
      await apiClient.put(`/Notifications/${notificationId}/read`);
      await signalRService.markNotificationAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put('/Notifications/read-all');
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await apiClient.delete(`/Notifications/${notificationId}`);
      await loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await apiClient.delete('/Notifications');
      await loadNotifications();
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 