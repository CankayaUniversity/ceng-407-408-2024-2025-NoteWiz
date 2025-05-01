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
import { useTasks } from '../contexts/TaskContext';
import { useCategories } from '../contexts/CategoriesContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import NotificationService from '../services/NotificationService';
import { COLORS } from '../constants/theme';

type TaskDetailScreenRouteProps = RouteProp<RootStackParamList, 'TaskDetail'>;
type TaskDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TaskDetail'>;

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
  const presetDueDate = route.params?.presetDueDate 
    ? new Date(route.params.presetDueDate) 
    : undefined;
  
  const editingTask = taskId ? tasks.find(t => t.id === taskId) : undefined;
  
  console.log('TaskDetail - taskId:', taskId);
  console.log('TaskDetail - presetDueDate:', presetDueDate);
  console.log('TaskDetail - editingTask:', editingTask ? editingTask.title : 'Creating new task');

  // Form durumu
  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(editingTask?.dueDate || presetDueDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(editingTask?.priority || 'medium');
  const [categoryId, setCategoryId] = useState<string | undefined>(editingTask?.categoryId);
  const [completed, setCompleted] = useState(editingTask?.completed || false);
  
  // Hatırlatıcı seçenekleri
  const [hasReminder, setHasReminder] = useState(editingTask?.reminder !== undefined);
  const [reminderDate, setReminderDate] = useState<Date | undefined>(
    editingTask?.reminder || (dueDate ? new Date(dueDate.getTime() - 30 * 60000) : undefined) // 30 dakika önce
  );
  const [showReminderDatePicker, setShowReminderDatePicker] = useState(false);
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);

  useEffect(() => {
    // Başlık ekran başlığını ayarla
    navigation.setOptions({
      headerTitle: taskId ? 'Görevi Düzenle' : 'Yeni Görev Oluştur',
    });
  }, [navigation, taskId]);

  // Tarih ve saat değiştirildiğinde alarm/hatırlatıcıyı da güncelle
  useEffect(() => {
    if (dueDate && hasReminder) {
      // Eğer hatırlatıcı yoksa veya bitiş tarihinden sonraysa
      if (!reminderDate || reminderDate > dueDate) {
        // Varsayılan olarak bitiş tarihinden 30 dakika önce ayarla
        const newReminderDate = new Date(dueDate.getTime() - 30 * 60000);
        setReminderDate(newReminderDate);
      }
    }
  }, [dueDate, hasReminder]);

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

  // Hatırlatıcı tarih seçimi
  const handleReminderDateChange = (event: any, selectedDate?: Date) => {
    setShowReminderDatePicker(false);
    
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      if (reminderDate) {
        newDate.setHours(reminderDate.getHours(), reminderDate.getMinutes());
      } else {
        const now = new Date();
        newDate.setHours(now.getHours(), now.getMinutes());
      }
      setReminderDate(newDate);
      setShowReminderTimePicker(true);
    }
  };

  // Hatırlatıcı saat seçimi
  const handleReminderTimeChange = (event: any, selectedTime?: Date) => {
    setShowReminderTimePicker(false);
    
    if (selectedTime && reminderDate) {
      const newDate = new Date(reminderDate);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      
      // Eğer bitiş tarihi varsa, hatırlatıcının önce olması gerektiğini kontrol et
      if (dueDate && newDate >= dueDate) {
        Alert.alert(
          'Geçersiz Hatırlatıcı',
          'Hatırlatıcı zamanı, bitiş tarihinden önce olmalıdır.',
          [{ text: 'Tamam' }]
        );
        return;
      }
      
      setReminderDate(newDate);
    }
  };

  // Öncelik ayarlama işleyicisi
  const handlePriorityChange = (newPriority: 'low' | 'medium' | 'high') => {
    setPriority(newPriority);
  };

  // Hatırlatıcı geçerliliğini kontrol et
  const validateReminder = (): boolean => {
    if (!hasReminder || !reminderDate || !dueDate) return true;
    
    if (reminderDate >= dueDate) {
      Alert.alert(
        'Geçersiz Hatırlatıcı',
        'Hatırlatıcı zamanı, bitiş tarihinden önce olmalıdır.',
        [{ text: 'Tamam' }]
      );
      return false;
    }
    
    const now = new Date();
    if (reminderDate <= now) {
      Alert.alert(
        'Geçersiz Hatırlatıcı',
        'Hatırlatıcı zamanı, şu andan sonra olmalıdır.',
        [{ text: 'Tamam' }]
      );
      return false;
    }
    
    return true;
  };

  // Kaydetme işlemi
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir görev başlığı girin');
      return;
    }

    // Hatırlatıcı kontrolü
    if (!validateReminder()) {
      return;
    }

    setIsLoading(true);
    console.log('Saving task:', title);
    
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        dueDate,
        priority,
        categoryId,
        completed,
        reminder: hasReminder ? reminderDate : undefined,
      };

      let savedTaskId: string | undefined = taskId;

      if (taskId) {
        await updateTask(taskId, taskData);
        console.log('Task updated successfully');
      } else {
        await addTask(taskData);  // Burada 'addTask' bir değer döndürmüyorsa, savedTaskId undefined olacak
        savedTaskId = undefined; // Eğer addTask bir id döndürmüyorsa, savedTaskId'yi undefined olarak atayın.
        console.log('Task added successfully');
      }

      // Eğer görev kaydedildiyse ve hatırlatıcı varsa
      if (savedTaskId && hasReminder && reminderDate) {
        const task = {
          id: savedTaskId,
          ...taskData,
          userId: '', // NotificationService içinde bu alan kullanılmıyor
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Bildirimi programla
        await NotificationService.scheduleTaskReminder(task);
      } else if (savedTaskId) {
        // Eğer hatırlatıcı kaldırıldıysa ilgili bildirimleri iptal et
        await NotificationService.cancelTaskNotifications(savedTaskId);
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving task:', error);
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

  // Saat formatı oluşturucu
  const formatTime = (date: Date | undefined) => {
    if (!date) return 'Saat seç';
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
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
                if (reminderDate) {
                setShowReminderTimePicker(true);
                }
            }}
            >
            <Text style={styles.dateTimeText}>
                {formatTime(reminderDate)}
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
          <Text style={styles.label}>Öncelik</Text>
          <View style={styles.priorityButtons}>
            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === 'low' && styles.activePriorityButton,
                priority === 'low' && { backgroundColor: '#E9FAF0' }
              ]}
              onPress={() => handlePriorityChange('low')}
            >
              <View 
                style={[
                  styles.priorityDot,
                  { backgroundColor: '#34C759' }
                ]} 
              />
              <Text style={styles.priorityText}>Düşük</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === 'medium' && styles.activePriorityButton,
                priority === 'medium' && { backgroundColor: '#FFF9E8' }
              ]}
              onPress={() => handlePriorityChange('medium')}
            >
              <View 
                style={[
                  styles.priorityDot,
                  { backgroundColor: '#FF9500' }
                ]} 
              />
              <Text style={styles.priorityText}>Orta</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === 'high' && styles.activePriorityButton,
                priority === 'high' && { backgroundColor: '#FFEEEE' }
              ]}
              onPress={() => handlePriorityChange('high')}
            >
              <View 
                style={[
                  styles.priorityDot,
                  { backgroundColor: '#FF3B30' }
                ]} 
              />
              <Text style={styles.priorityText}>Yüksek</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Tamamlandı</Text>
            <Switch
              value={completed}
              onValueChange={setCompleted}
              trackColor={{ false: '#CED4DA', true: COLORS.primary.main + '80' }}
              thumbColor={completed ? COLORS.primary.main : '#F5F5F5'}
            />
          </View>
        </View>

        {/* Hatırlatıcı ayarları */}
        <View style={styles.formSection}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Hatırlatıcı Ekle</Text>
            <Switch
              value={hasReminder}
              onValueChange={(value) => {
                setHasReminder(value);
                if (value && dueDate) {
                  // Varsayılan olarak bitiş tarihinden 30 dakika önce ayarla
                  setReminderDate(new Date(dueDate.getTime() - 30 * 60000));
                }
              }}
              trackColor={{ false: '#CED4DA', true: COLORS.primary.main + '80' }}
              thumbColor={hasReminder ? COLORS.primary.main : '#F5F5F5'}
              disabled={!dueDate}
            />
          </View>
          
          {hasReminder && dueDate && (
            <View style={styles.reminderContainer}>
              <Text style={styles.reminderText}>Hatırlatma Zamanı:</Text>
              
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowReminderDatePicker(true)}
                >
                  <Text style={styles.dateTimeText}>
                    {formatDate(reminderDate)}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => reminderDate && setShowReminderTimePicker(true)}
                >
                  <Text style={styles.dateTimeText}>
                    {formatTime(reminderDate)}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {showReminderDatePicker && (
                <DateTimePicker
                  value={reminderDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleReminderDateChange}
                  minimumDate={new Date()}
                  maximumDate={dueDate}
                />
              )}
              
              {showReminderTimePicker && (
                <DateTimePicker
                  value={reminderDate || new Date()}
                  mode="time"
                  display="default"
                  onChange={handleReminderTimeChange}
                />
              )}
              
              <Text style={styles.reminderHint}>
                Not: Hatırlatıcı, görev bitiş tarihinden önce olmalıdır.
              </Text>
            </View>
          )}
          
          {!dueDate && hasReminder && (
            <Text style={styles.warningText}>
              Hatırlatıcı eklemek için önce bir görev tarihi belirleyin.
            </Text>
          )}
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