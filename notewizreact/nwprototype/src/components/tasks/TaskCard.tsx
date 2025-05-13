// src/components/tasks/TaskCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../../contexts/TaskContext';
import { COLORS, SHADOWS } from '../../constants/theme';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// Tarih formatı oluşturucu
const formatDate = (date: Date | undefined) => {
  if (!date) return '';
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = date.getDate() === today.getDate() &&
                 date.getMonth() === today.getMonth() &&
                 date.getFullYear() === today.getFullYear();
  
  const isTomorrow = date.getDate() === tomorrow.getDate() &&
                    date.getMonth() === tomorrow.getMonth() &&
                    date.getFullYear() === tomorrow.getFullYear();
  
  if (isToday) {
    return `Bugün, ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (isTomorrow) {
    return `Yarın, ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
};

// Öncelik badge'i için renkler
const getPriorityColor = (priority: Task['priority']) => {
  switch(priority) {
    case 'high': return '#FF3B30';
    case 'medium': return '#FF9500';
    case 'low': return '#34C759';
    default: return '#FF9500';
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onToggleComplete, 
  onEdit, 
  onDelete 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.taskCard,
        task.completed && styles.completedTaskCard
      ]}
      onPress={() => onEdit(task.id)}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={[
          styles.checkbox,
          task.completed && styles.checkedBox
        ]}
        onPress={() => onToggleComplete(task.id)}
      >
        {task.completed && <View style={styles.checkmark} />}
      </TouchableOpacity>
      
      <View style={styles.taskContent}>
        <Text 
          style={[
            styles.taskTitle,
            task.completed && styles.completedTaskText
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        
        {task.description ? (
          <Text 
            style={[
              styles.taskDescription,
              task.completed && styles.completedTaskText
            ]}
            numberOfLines={1}
          >
            {task.description}
          </Text>
        ) : null}
        
        <View style={styles.taskMeta}>
          {task.dueDate && (
            <Text style={styles.taskDate}>
              {formatDate(task.dueDate)}
            </Text>
          )}
          
          {task.categoryId && (
            <View 
              style={[
                styles.categoryBadge,
                { backgroundColor: COLORS.primary.light + '20' }
              ]}
            >
              <Text 
                style={[styles.categoryText, { color: COLORS.primary.main }]}
              >
                {task.categoryId}
              </Text>
            </View>
          )}
          
          <View 
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(task.priority) }
            ]}
          >
            <Text style={styles.priorityText}>
              {task.priority === 'high' ? 'Yüksek' : 
               task.priority === 'medium' ? 'Orta' : 'Düşük'}
            </Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(task.id)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary.main,
    ...SHADOWS.sm,
  },
  completedTaskCard: {
    borderLeftColor: '#ADB5BD',
    backgroundColor: '#F8F9FA',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary.main,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: COLORS.primary.main,
  },
  checkmark: {
    width: 10,
    height: 5,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#ADB5BD',
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  taskDate: {
    fontSize: 12,
    color: '#868E96',
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#868E96',
    fontWeight: 'bold',
  },
});

export default TaskCard;