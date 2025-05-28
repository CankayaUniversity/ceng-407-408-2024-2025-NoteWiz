// src/components/ui/TaskFilter.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../../constants/theme';

type FilterType = 'all' | 'active' | 'completed';

interface TaskFilterProps {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const TaskFilter: React.FC<TaskFilterProps> = ({
  selectedFilter,
  onFilterChange
}) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <TouchableOpacity 
        style={[
          styles.filterButton,
          selectedFilter === 'all' && styles.activeFilterButton
        ]}
        onPress={() => onFilterChange('all')}
      >
        <Text 
          style={[
            styles.filterText,
            selectedFilter === 'all' && styles.activeFilterText
          ]}
        >
          Tümü
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.filterButton,
          selectedFilter === 'active' && styles.activeFilterButton
        ]}
        onPress={() => onFilterChange('active')}
      >
        <Text 
          style={[
            styles.filterText,
            selectedFilter === 'active' && styles.activeFilterText
          ]}
        >
          Aktif
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.filterButton,
          selectedFilter === 'completed' && styles.activeFilterButton
        ]}
        onPress={() => onFilterChange('completed')}
      >
        <Text 
          style={[
            styles.filterText,
            selectedFilter === 'completed' && styles.activeFilterText
          ]}
        >
          Tamamlanan
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  contentContainer: {
    paddingVertical: 4,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F8F9FA',
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary.main,
  },
  filterText: {
    color: '#666666',
    fontWeight: '500',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
});

export default TaskFilter;