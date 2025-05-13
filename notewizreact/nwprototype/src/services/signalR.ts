import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import EventEmitter from '../utils/EventEmitter';

class SignalRService {
  private notificationConnection: HubConnection | null = null;
  private noteConnection: HubConnection | null = null;

  // Getter for noteConnection
  public getNoteConnection(): HubConnection | null {
    return this.noteConnection;
  }

  private getBaseUrl() {
    return Platform.OS === 'android' 
      ? 'http://10.0.2.2:5263' // Android Emulator için localhost
      : 'http://localhost:5263'; // iOS için
  }

  async initializeNotificationConnection() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('No token found for SignalR connection');
        return;
      }

      const url = `${this.getBaseUrl()}/hubs/notification`;
      const options = {
        accessTokenFactory: () => token,
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      this.notificationConnection = new HubConnectionBuilder()
        .withUrl(url, options)
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      this.notificationConnection.on('ReceiveNotification', (notification) => {
        console.log('Received notification:', notification);
        EventEmitter.emit('onNotification', notification);
      });

      this.notificationConnection.on('ReceiveTaskReminder', (taskId, taskTitle) => {
        console.log('Received task reminder:', taskId, taskTitle);
        EventEmitter.emit('onTaskReminder', { taskId, taskTitle });
      });

      this.notificationConnection.on('ReceiveNoteShared', (noteId, noteTitle, sharedByUsername) => {
        console.log('Received note share notification:', noteId, noteTitle, sharedByUsername);
        EventEmitter.emit('onNoteShared', { noteId, noteTitle, sharedByUsername });
      });

      await this.notificationConnection.start();
      console.log('SignalR Notification Connection started');
    } catch (error) {
      console.error('Error starting SignalR Notification Connection:', error);
    }
  }

  async initializeNoteConnection() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('No token found for SignalR connection');
        return;
      }

      const url = `${this.getBaseUrl()}/hubs/notes`;
      const options = {
        accessTokenFactory: () => token,
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      this.noteConnection = new HubConnectionBuilder()
        .withUrl(url, options)
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      this.noteConnection.on('UserJoined', (username) => {
        console.log('User joined:', username);
      });

      this.noteConnection.on('UserLeft', (username) => {
        console.log('User left:', username);
      });

      this.noteConnection.on('NoteUpdated', (content) => {
        console.log('Note updated:', content);
      });

      this.noteConnection.on('DrawingAdded', (drawingData) => {
        console.log('Drawing added:', drawingData);
      });

      this.noteConnection.on('UserTyping', (username) => {
        console.log('User is typing:', username);
      });

      await this.noteConnection.start();
      console.log('SignalR Note Connection started');
    } catch (error) {
      console.error('Error starting SignalR Note Connection:', error);
    }
  }

  async joinNoteSession(noteId: number) {
    try {
      if (this.noteConnection?.state === 'Connected') {
        await this.noteConnection.invoke('JoinNoteSession', noteId);
      }
    } catch (error) {
      console.error('Error joining note session:', error);
    }
  }

  async leaveNoteSession(noteId: number) {
    try {
      if (this.noteConnection?.state === 'Connected') {
        await this.noteConnection.invoke('LeaveNoteSession', noteId);
      }
    } catch (error) {
      console.error('Error leaving note session:', error);
    }
  }

  async updateNote(noteId: string, content: string) {
    try {
      if (this.noteConnection?.state === 'Connected') {
        await this.noteConnection.invoke('UpdateNote', noteId, content);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  }

  async userIsTyping(noteId: string) {
    try {
      if (this.noteConnection?.state === 'Connected') {
        await this.noteConnection.invoke('UserIsTyping', noteId);
      }
    } catch (error) {
      console.error('Error sending typing notification:', error);
    }
  }

  async markNotificationAsRead(notificationId: string) {
    try {
      if (this.notificationConnection?.state === 'Connected') {
        await this.notificationConnection.invoke('MarkNotificationAsRead', notificationId);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async disconnect() {
    try {
      if (this.notificationConnection) {
        await this.notificationConnection.stop();
      }
      if (this.noteConnection) {
        await this.noteConnection.stop();
      }
    } catch (error) {
      console.error('Error disconnecting from SignalR:', error);
    }
  }
}

export default new SignalRService(); 