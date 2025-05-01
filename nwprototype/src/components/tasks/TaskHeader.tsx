// src/components/tasks/TasksHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SearchBar } from '../ui/SearchBar';
import { COLORS } from '../../constants/theme';

interface TasksHeaderProps {
  totalTasks: number;
  completedTasks: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const TasksHeader: React.FC<TasksHeaderProps> = ({
  totalTasks,
  completedTasks,
  searchQuery,
  onSearchChange
}) => {
  const completionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Görevler</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {completedTasks}/{totalTasks} tamamlandı
          </Text>
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${completionPercentage}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder="Görevlerde ara..."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  progressContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary.main,
    borderRadius: 2,
  },
});

export default TasksHeader;