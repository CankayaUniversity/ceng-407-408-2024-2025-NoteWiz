// src/screens/TaskDetailScreen.tsx - Hatırlatıcı Ekleme
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTasks, Task } from '../contexts/TasksContext';
import { useCategories } from '../contexts/CategoriesContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import NotificationService from '../services/NotificationService';
import { CreateTaskDto } from '../services/taskService';
import { COLORS } from '../constants/theme';

type TaskDetailScreenRouteProps = RouteProp<RootStackParamList, 'TaskDetail'>;
type TaskDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TaskDetail'>;

const formatTime = (date?: Date) => {
  if (!date) return 'Saat seç';
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

const TaskDetailScreen = () => {
  console.log('TaskDetailScreen rendered');
  
  const navigation = useNavigation<TaskDetailScreenNavigationProp>();
  const route = useRoute<TaskDetailScreenRouteProps>();
  const { tasks, addTask, updateTask } = useTasks();
  const { categories } = useCategories();
  const [isLoading, setIsLoading] = useState(false);

  // Görev ID'si
  const taskId = route.params?.taskId;
  // Takvimden önceden seçilen tarih
  // const presetDueDate = route.params?.presetDueDate 
  //   ? new Date(route.params.presetDueDate) 
  //   : undefined;
  
  const editingTask = tasks.find(t => t.id?.toString() === taskId?.toString());
  
  console.log('TaskDetail - taskId:', taskId);
  // console.log('TaskDetail - presetDueDate:', presetDueDate);
  console.log('TaskDetail - editingTask:', editingTask ? editingTask.title : 'Creating new task');

  // State initialization with date conversion
  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    editingTask?.dueDate ? new Date(editingTask.dueDate) : undefined
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isCompleted, setIsCompleted] = useState(editingTask?.isCompleted || false);
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date | undefined>(undefined);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  
  const priorityMap = { low: 3, medium: 2, high: 1 };
  const reversePriorityMap = { 1: 'high', 2: 'medium', 3: 'low' } as const;
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    editingTask?.priority
      ? typeof editingTask.priority === 'number'
        ? reversePriorityMap[editingTask.priority as 1 | 2 | 3] || 'low'
        : (editingTask.priority as 'low' | 'medium' | 'high')
      : 'low'
  );

  useEffect(() => {
    // Başlık ekran başlığını ayarla
    navigation.setOptions({
      headerTitle: taskId ? 'Görevi Düzenle' : 'Yeni Görev Oluştur',
    });
  }, [navigation, taskId]);

  // Tarih seçimi işleyicisi
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    
    if (selectedDate) {
      // Mevcut saati koru, sadece tarihi güncelle
      const newDate = new Date(selectedDate);
      if (dueDate) {
        newDate.setHours(dueDate.getHours(), dueDate.getMinutes());
      } else {
        // Eğer daha önce tarih seçilmemişse, şu anki saati kullan
        const now = new Date();
        newDate.setHours(now.getHours(), now.getMinutes());
      }
      setDueDate(newDate);
      setShowTimePicker(true);
    }
  };

  // Saat seçimi işleyicisi
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    
    if (selectedTime && dueDate) {
      const newDate = new Date(dueDate);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDueDate(newDate);
    }
  };

  // Kaydetme işlemi
  const handleSave = async () => {
    try {
      if (!title.trim()) {
        Alert.alert('Hata', 'Başlık alanı boş bırakılamaz');
        return;
      }

      setIsLoading(true);
      console.log('Saving task:', title);
      
      const taskData = {
        title,
        description,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        isCompleted,
        priority,
        reminder: hasReminder && reminderDate ? reminderDate.toISOString() : undefined,
      };

      if (taskId) {
        const updatedTask = await updateTask(Number(taskId), taskData);
        console.log('Task updated successfully');
        
        if (hasReminder && reminderDate) {
          await NotificationService.scheduleTaskReminder({
            ...updatedTask,
            id: String(updatedTask.id),
            reminder: reminderDate.toISOString(),
            priority: priority,
            isCompleted: updatedTask.isCompleted,
          });
        } else {
          await NotificationService.cancelNotification(`task-${updatedTask.id}`);
        }
      } else {
        // Yeni görev ekle
        const newTask = await addTask(taskData);
        console.log('Task added successfully with ID:', newTask.id);
        
        if (hasReminder && reminderDate) {
          await NotificationService.scheduleTaskReminder({
            ...newTask,
            id: String(newTask.id),
            reminder: reminderDate.toISOString(),
            priority: priority,
            isCompleted: newTask.isCompleted,
          });
        }
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Görev kaydetme hatası:', error);
      Alert.alert('Hata', 'Görev kaydedilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Tarih formatı oluşturucu
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Tarih seç';
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.formSection}>
          <Text style={styles.label}>Görev Başlığı</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Görev başlığını girin"
            maxLength={100}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Açıklama (İsteğe Bağlı)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Görev hakkında notlar ekleyin"
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Görev Tarihi</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeText}>
                {formatDate(dueDate)}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => {
                if (dueDate) {
                  setShowTimePicker(true);
                }
              }}
            >
              <Text style={styles.dateTimeText}>
                {formatTime(dueDate)}
              </Text>
            </TouchableOpacity>
          </View>
          
          {showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
          
          {showTimePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        <View style={styles.formSection}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Hatırlatıcı Kur</Text>
            <Switch
              value={hasReminder}
              onValueChange={setHasReminder}
              trackColor={{ false: '#CED4DA', true: COLORS.primary.main + '80' }}
              thumbColor={hasReminder ? COLORS.primary.main : '#F5F5F5'}
            />
          </View>
          {hasReminder && (
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowReminderPicker(true)}
            >
              <Text style={styles.dateTimeText}>
                {reminderDate ? reminderDate.toLocaleString('tr-TR') : 'Hatırlatma zamanı seç'}
              </Text>
            </TouchableOpacity>
          )}
          {showReminderPicker && (
            <DateTimePicker
              value={reminderDate || new Date()}
              mode="datetime"
              display="default"
              onChange={(event, date) => {
                setShowReminderPicker(false);
                if (date) setReminderDate(date);
              }}
            />
          )}
        </View>

        <View style={styles.formSection}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Tamamlandı</Text>
            <Switch
              value={isCompleted}
              onValueChange={setIsCompleted}
              trackColor={{ false: '#CED4DA', true: COLORS.primary.main + '80' }}
              thumbColor={isCompleted ? COLORS.primary.main : '#F5F5F5'}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>
              {taskId ? 'Görevi Güncelle' : 'Görevi Kaydet'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    flexDirection: 'row',
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    flex: 1,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333333',
  },
  disabledText: {
    color: '#ADB5BD',
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
    marginRight: 8,
  },
  activePriorityButton: {
    borderColor: COLORS.primary.main,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 14,
    color: '#333333',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderContainer: {
    marginTop: 16,
  },
  reminderText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  reminderHint: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  warningText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 8,
  },
  buttonContainer: {
    padding: 16,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: COLORS.primary.main,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskDetailScreen;