// src/services/NotificationService.ts
import notifee, { 
    TimestampTrigger, 
    TriggerType, 
    AndroidImportance,
    RepeatFrequency
  } from '@notifee/react-native';
  import { Task } from '../contexts/TaskContext';
  
  class NotificationService {
    // Bildirim kanalı oluştur (Android için gerekli)
    async createChannel() {
      return await notifee.createChannel({
        id: 'task-reminders',
        name: 'Görev Hatırlatıcıları',
        lights: true,
        vibration: true,
        importance: AndroidImportance.HIGH,
      });
    }
  
    // Görev için hatırlatıcı oluştur
    async scheduleTaskReminder(task: Task) {
      // Eğer bitiş tarihi yoksa bildirimi oluşturamayız
      if (!task.dueDate || !task.reminder) {
        console.log('Bu görev için hatırlatıcı veya bitiş tarihi mevcut değil:', task.title);
        return null;
      }
  
      // Hatırlatma tarihini milisaniye cinsinden hesapla
      const reminderTime = task.reminder.getTime();
      
      // Tetikleyici oluştur - belirtilen zamanda tetiklenir
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: reminderTime,
      };
  
      // Bildirimin eşsiz ID'si
      const notificationId = `task-reminder-${task.id}`;
  
      try {
        // Eğer bu ID'ye sahip bir bildirim varsa önce iptal et
        await this.cancelNotification(notificationId);
  
        // Kanal oluştur/al
        const channelId = await this.createChannel();
  
        // Bildirimi oluştur ve zamanla
        await notifee.createTriggerNotification(
          {
            id: notificationId,
            title: `Görev Hatırlatıcı: ${task.title}`,
            body: task.description || 'Bitirme zamanı yaklaşıyor',
            android: {
              channelId,
              importance: AndroidImportance.HIGH,
              pressAction: {
                id: 'default',
              },
            },
            ios: {
              sound: 'default',
            },
            data: {
              taskId: task.id,
            },
          },
          trigger,
        );
  
        console.log(`Görev hatırlatıcısı planlandı: ${task.title} - ${new Date(reminderTime).toLocaleString()}`);
        return notificationId;
      } catch (error) {
        console.error('Bildirim oluşturma hatası:', error);
        return null;
      }
    }
  
    // Görev için tekrarlanan hatırlatıcı oluştur
    async scheduleRepeatingTaskReminder(
      task: Task, 
      frequency: RepeatFrequency = RepeatFrequency.DAILY
    ) {
      // Eğer bitiş tarihi yoksa bildirimi oluşturamayız
      if (!task.dueDate) {
        console.log('Bu görev için bitiş tarihi mevcut değil:', task.title);
        return null;
      }
  
      // Başlangıç saati (ilk bildirim)
      const startTime = new Date();
      startTime.setHours(9, 0, 0, 0); // Varsayılan: Sabah 9:00
      
      // Tetikleyici oluştur - tekrarlı
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: startTime.getTime(),
        repeatFrequency: frequency,
      };
  
      // Bildirimin eşsiz ID'si
      const notificationId = `task-recurring-${task.id}`;
  
      try {
        // Eğer bu ID'ye sahip bir bildirim varsa önce iptal et
        await this.cancelNotification(notificationId);
  
        // Kanal oluştur/al
        const channelId = await this.createChannel();
  
        // Bildirimi oluştur ve zamanla
        await notifee.createTriggerNotification(
          {
            id: notificationId,
            title: `Tekrarlanan Hatırlatıcı: ${task.title}`,
            body: task.description || 'Bu görev için düzenli hatırlatma',
            android: {
              channelId,
              importance: AndroidImportance.DEFAULT,
              pressAction: {
                id: 'default',
              },
            },
            ios: {
              sound: 'default',
            },
            data: {
              taskId: task.id,
              recurring: "true",
            },
          },
          trigger,
        );
  
        console.log(`Tekrarlanan hatırlatıcı planlandı: ${task.title} - Her ${frequency}`);
        return notificationId;
      } catch (error) {
        console.error('Tekrarlanan bildirim oluşturma hatası:', error);
        return null;
      }
    }
  
    // Belirli bir bildirimi iptal et
    async cancelNotification(notificationId: string) {
      try {
        await notifee.cancelNotification(notificationId);
        console.log(`Bildirim iptal edildi: ${notificationId}`);
        return true;
      } catch (error) {
        console.error('Bildirim iptal hatası:', error);
        return false;
      }
    }
  
    // Belirli bir görevle ilişkili tüm bildirimleri iptal et
    async cancelTaskNotifications(taskId: string) {
      try {
        await notifee.cancelNotification(`task-reminder-${taskId}`);
        await notifee.cancelNotification(`task-recurring-${taskId}`);
        console.log(`Görevle ilgili tüm bildirimler iptal edildi: ${taskId}`);
        return true;
      } catch (error) {
        console.error('Görev bildirimlerini iptal ederken hata:', error);
        return false;
      }
    }
  
    // Tüm bildirimleri iptal et
    async cancelAllNotifications() {
      try {
        await notifee.cancelAllNotifications();
        console.log('Tüm bildirimler iptal edildi');
        return true;
      } catch (error) {
        console.error('Tüm bildirimleri iptal ederken hata:', error);
        return false;
      }
    }
  
    // Anlık bildirim gönder
    async displayNotification(title: string, body: string, data: any = {}) {
      try {
        const channelId = await this.createChannel();
        
        await notifee.displayNotification({
          title,
          body,
          android: {
            channelId,
            pressAction: {
              id: 'default',
            },
          },
          data,
        });
        
        console.log('Anlık bildirim gönderildi');
        return true;
      } catch (error) {
        console.error('Anlık bildirim gönderme hatası:', error);
        return false;
      }
    }
  }
  
  export default new NotificationService();