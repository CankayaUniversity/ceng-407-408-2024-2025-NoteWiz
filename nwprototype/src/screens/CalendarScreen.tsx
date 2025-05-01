// src/screens/CalendarScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTasks, Task } from '../contexts/TaskContext';
import { COLORS, SHADOWS } from '../constants/theme';

type CalendarScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DayTasks {
  [date: string]: Task[];
}

const CalendarScreen: React.FC = () => {
  const { tasks } = useTasks();
  const navigation = useNavigation<CalendarScreenNavigationProp>();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0] // Bugünün tarihi (YYYY-MM-DD formatında)
  );
  const [markedDates, setMarkedDates] = useState<{[date: string]: any}>({});
  const [dayTasks, setDayTasks] = useState<DayTasks>({});
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([]);

  // Takvimde işaretlenecek günleri ve her gün için görevleri hazırla
  useEffect(() => {
    const newMarkedDates: {[date: string]: any} = {};
    const newDayTasks: DayTasks = {};

    // Bugünün tarihini işaretle
    const today = new Date().toISOString().split('T')[0];
    newMarkedDates[today] = { selected: today === selectedDate, marked: false, dotColor: COLORS.primary.main };

    // Görevleri tarihlere göre grupla
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateStr = new Date(task.dueDate).toISOString().split('T')[0];
        
        // İşaretli tarihler için ayarlar
        newMarkedDates[dateStr] = {
          ...newMarkedDates[dateStr],
          marked: true,
          dotColor: task.completed ? COLORS.success.main : COLORS.primary.main,
          selected: dateStr === selectedDate
        };

        // Gün görevleri için
        if (!newDayTasks[dateStr]) {
          newDayTasks[dateStr] = [];
        }
        newDayTasks[dateStr].push(task);
      }
    });

    // Seçili gün için işaretleme
    if (newMarkedDates[selectedDate]) {
      newMarkedDates[selectedDate] = {
        ...newMarkedDates[selectedDate],
        selected: true
      };
    } else {
      newMarkedDates[selectedDate] = { selected: true };
    }

    setMarkedDates(newMarkedDates);
    setDayTasks(newDayTasks);
    setSelectedDateTasks(newDayTasks[selectedDate] || []);
  }, [tasks, selectedDate]);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTaskPress = (taskId: string) => {
    navigation.navigate('TaskDetail', { taskId });
  };

  const handleAddTask = () => {
    const selectedDateObj = new Date(selectedDate);
    // Saat bilgisini 12:00 olarak ayarla
    selectedDateObj.setHours(12, 0, 0, 0);
    
    navigation.navigate('TaskDetail', { 
      presetDueDate: selectedDateObj.toISOString() 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Calendar
        style={styles.calendar}
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
          calendarBackground: '#FFFFFF',
          textSectionTitleColor: '#666666',
          selectedDayBackgroundColor: COLORS.primary.main,
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: COLORS.primary.main,
          dayTextColor: '#333333',
          textDisabledColor: '#D9E1E8',
          dotColor: COLORS.primary.main,
          selectedDotColor: '#FFFFFF',
          arrowColor: COLORS.primary.main,
          monthTextColor: '#333333',
          indicatorColor: COLORS.primary.main
        }}
      />

      <View style={styles.dateHeader}>
        <Text style={styles.dateHeaderText}>{formatDate(selectedDate)}</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddTask}
        >
          <Text style={styles.addButtonText}>Görev Ekle</Text>
        </TouchableOpacity>
      </View>

      {selectedDateTasks.length > 0 ? (
        <FlatList
          data={selectedDateTasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.taskItem,
                item.completed && styles.completedTask
              ]}
              onPress={() => handleTaskPress(item.id)}
            >
              <View style={[
                styles.priorityIndicator,
                { 
                  backgroundColor: 
                    item.priority === 'high' ? '#FF3B30' :
                    item.priority === 'medium' ? '#FF9500' : '#34C759'
                }
              ]} />
              <View style={styles.taskContent}>
                <Text style={[
                  styles.taskTitle,
                  item.completed && styles.completedText
                ]}>{item.title}</Text>
                {item.description ? (
                  <Text style={[
                    styles.taskDescription,
                    item.completed && styles.completedText
                  ]} numberOfLines={1}>{item.description}</Text>
                ) : null}
              </View>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: item.completed ? '#34C759' : '#E5E5EA' }
              ]} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.tasksList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Bu tarihte görev bulunmuyor</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  calendar: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F8F8',
  },
  dateHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  addButton: {
    backgroundColor: COLORS.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  tasksList: {
    padding: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    ...SHADOWS.sm,
  },
  completedTask: {
    backgroundColor: '#F8F8F8',
  },
  priorityIndicator: {
    width: 4,
    height: '70%',
    borderRadius: 2,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666666',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999999',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
});

export default CalendarScreen;