// src/components/tasks/TaskEmptyState.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { COLORS } from '../../constants/theme';

interface TaskEmptyStateProps {
  filter: 'all' | 'active' | 'completed';
  searchQuery: string;
  onCreateTask: () => void;
}

const TaskEmptyState: React.FC<TaskEmptyStateProps> = ({ 
  filter, 
  searchQuery, 
  onCreateTask 
}) => {
  const getMessage = () => {
    if (searchQuery) {
      return `"${searchQuery}" ile eşleşen görev bulunamadı`;
    }
    
    switch (filter) {
      case 'active':
        return 'Aktif görev bulunamadı';
      case 'completed':
        return 'Tamamlanmış görev bulunamadı';
      default:
        return 'Henüz görev eklemediniz';
    }
  };

  const getSubMessage = () => {
    if (searchQuery) {
      return 'Farklı bir arama terimi deneyin veya yeni bir görev oluşturun';
    }
    
    switch (filter) {
      case 'active':
        return 'Tüm görevleriniz tamamlanmış görünüyor. Tebrikler!';
      case 'completed':
        return 'Henüz tamamlanmış göreviniz yok';
      default:
        return 'Görevlerinizi organize etmek ve takip etmek için görev ekleyin';
    }
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(500)}
      style={styles.container}
    >
      <Text style={styles.title}>{getMessage()}</Text>
      <Text style={styles.subtitle}>{getSubMessage()}</Text>
      
      <TouchableOpacity 
        style={styles.createButton}
        onPress={onCreateTask}
      >
        <Text style={styles.createButtonText}>Görev Oluştur</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: COLORS.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskEmptyState;