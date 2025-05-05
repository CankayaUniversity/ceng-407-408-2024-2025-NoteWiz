// src/services/NotificationService.ts
import notifee, { 
    TimestampTrigger, 
    TriggerType, 
    AndroidImportance,
    RepeatFrequency
  } from '@notifee/react-native';
  import { Task, CreateTaskDto } from './taskService';
  
  class NotificationService {
    private static CHANNEL_ID = 'task-reminders';
    private static CHANNEL_NAME = 'Task Reminders';
    private static CHANNEL_DESCRIPTION = 'Notifications for task reminders';
  
    // Bildirim kanalı oluştur (Android için gerekli)
    static async createChannel() {
      try {
        await notifee.createChannel({
          id: NotificationService.CHANNEL_ID,
          name: NotificationService.CHANNEL_NAME,
          description: NotificationService.CHANNEL_DESCRIPTION,
          importance: AndroidImportance.HIGH,
        });
        return NotificationService.CHANNEL_ID;
      } catch (error) {
        console.error('Kanal oluşturma hatası:', error);
        return NotificationService.CHANNEL_ID; // Hata durumunda varsayılan kanal ID'sini döndür
      }
    }
  
    // Görev için hatırlatıcı oluştur
    static async scheduleTaskReminder(task: Task | (CreateTaskDto & { id: string })) {
      if (!task.reminder) return;

      const reminderDate = typeof task.reminder === 'string' ? new Date(task.reminder) : task.reminder;
      const now = new Date();

      if (reminderDate <= now) {
        console.log('Reminder date is in the past, skipping notification');
        return;
      }

      // Bildirim ayarları
      const notificationId = `task-${task.id}`;
      const notificationTitle = task.title;
      const notificationBody = task.description || 'Hatırlatıcı zamanı geldi!';

      // Hatırlatma tarihini milisaniye cinsinden hesapla
      const reminderTime = reminderDate.getTime();
      
      // Tetikleyici oluştur - belirtilen zamanda tetiklenir
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: reminderTime,
      };
  
      try {
        // Eğer bu ID'ye sahip bir bildirim varsa önce iptal et
        await NotificationService.cancelNotification(notificationId);
  
        // Kanal oluştur/al
        const channelId = await NotificationService.createChannel();
  
        // Bildirimi oluştur ve zamanla
        await notifee.createTriggerNotification(
          {
            id: notificationId,
            title: notificationTitle,
            body: notificationBody,
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
        await NotificationService.cancelNotification(notificationId);
  
        // Kanal oluştur/al
        const channelId = await NotificationService.createChannel();
  
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
    static async cancelNotification(notificationId: string) {
      try {
        await notifee.cancelNotification(notificationId);
      } catch (error) {
        console.error('Bildirim iptal hatası:', error);
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
    static async cancelAllNotifications() {
      try {
        await notifee.cancelAllNotifications();
      } catch (error) {
        console.error('Tüm bildirimleri iptal etme hatası:', error);
      }
    }
  
    // Anlık bildirim gönder
    async displayNotification(title: string, body: string, data: any = {}) {
      try {
        const channelId = await NotificationService.createChannel();
        
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
  
    static async getScheduledNotifications() {
      try {
        return await notifee.getTriggerNotifications();
      } catch (error) {
        console.error('Planlanmış bildirimleri alma hatası:', error);
        return [];
      }
    }
  }
  
  export default NotificationService;