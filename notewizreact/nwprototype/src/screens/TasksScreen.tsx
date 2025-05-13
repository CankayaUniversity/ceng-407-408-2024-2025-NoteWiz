// src/screens/TasksScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTasks, Task } from '../contexts/TasksContext';
import { useCategories } from '../contexts/CategoriesContext';
import { SearchBar } from '../components/ui/SearchBar';
import { COLORS, SHADOWS } from '../constants/theme';

interface Note {
  // ... mevcut alanlar ...
  coverType: 'none' | 'preset' | 'generated';
  coverId?: string;      // Hazır şablonlar için
  coverImage?: string;   // Generated veya yüklenmiş kapak için URL
  coverColor?: string;   // Arka plan rengi için
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

const TasksScreen = () => {
  console.log('TasksScreen rendered'); // Debug için
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { tasks, isLoading, deleteTask, updateTask } = useTasks();
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('TasksScreen useEffect - tasks:', tasks.length);
  }, [tasks]);

  // Görevleri filtrele
  const filteredTasks = tasks.filter((task: Task) => {
    // Başlık ve açıklamada arama
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    // Aktif/tamamlanmış filtreleme
    if (filter === 'active') {
      return matchesSearch && !task.isCompleted;
    } else if (filter === 'completed') {
      return matchesSearch && task.isCompleted;
    }
    return matchesSearch;
  });

  // Bugün yapılacak görevler
  const todayTasks = filteredTasks.filter((task: Task) => {
    if (!task.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  });

  // Gecikmiş görevler
  const overdueTasks = filteredTasks.filter((task: Task) => {
    if (!task.dueDate || task.isCompleted) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });

  // Diğer tüm görevler
  const otherTasks = filteredTasks.filter((task: Task) => {
    if (!task.dueDate) return true; // Tarihi olmayan görevler de burada
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    // Bugün değilse ve gecikmiş değilse
    return !(
      (taskDate.getDate() === today.getDate() &&
       taskDate.getMonth() === today.getMonth() &&
       taskDate.getFullYear() === today.getFullYear()) ||
      (taskDate < today && !task.isCompleted)
    );
  });

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Yenileme işlemi (gerekiyorsa bağımlılıkları güncelleyebilirsiniz)
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleCreateTask = () => {
    console.log('Create task button pressed');
    navigation.navigate('TaskDetail', {});
  };

  const handleEditTask = (taskId: string) => {
    console.log('Edit task button pressed:', taskId);
    navigation.navigate('TaskDetail', { taskId });
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert(
      'Görevi Sil',
      'Bu görevi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(taskId);
            } catch (error) {
              Alert.alert('Hata', 'Görev silinirken bir hata oluştu');
            }
          }
        }
      ]
    );
  };

  // Görev kartı bileşeni
  const TaskCard = ({ task }: { task: Task }) => {
    // İlgili kategoriyi bul
    const category = categories.find(cat => String(cat.id) === task.categoryId);
    
    return (
      <TouchableOpacity
        style={[
          styles.taskCard,
          task.isCompleted && styles.completedTaskCard
        ]}
        onPress={() => handleEditTask(task.id.toString())}
        activeOpacity={0.7}
      >
        <TouchableOpacity
          style={[
            styles.checkbox,
            task.isCompleted && styles.checkedBox
          ]}
          onPress={() => updateTask(task.id, { isCompleted: !task.isCompleted })}
        >
          {task.isCompleted && <View style={styles.checkmark} />}
        </TouchableOpacity>
        
        <View style={styles.taskContent}>
          <Text 
            style={[
              styles.taskTitle,
              task.isCompleted && styles.completedTaskText
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          
          {task.description ? (
            <Text 
              style={[
                styles.taskDescription,
                task.isCompleted && styles.completedTaskText
              ]}
              numberOfLines={1}
            >
              {task.description}
            </Text>
          ) : null}
          
          <View style={styles.taskMeta}>
            {task.dueDate && (
              <Text style={styles.taskDate}>
                {formatDate(new Date(task.dueDate))}
              </Text>
            )}
            
            {category && (
              <View 
                style={[
                  styles.categoryBadge,
                  { backgroundColor: category.color + '20' }
                ]}
              >
                <Text 
                  style={[styles.categoryText, { color: category.color }]}
                >
                  {category.name}
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
          onPress={() => handleDeleteTask(task.id)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Görev bölümü başlığı
  const SectionHeader = ({ title, count }: { title: string, count: number }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Görevler</Text>
        
        <View style={styles.searchBarContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Görevlerde ara..."
            style={styles.searchBar}
          />
        </View>

        
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filter === 'all' && styles.activeFilterButton
            ]}
            onPress={() => setFilter('all')}
          >
            <Text 
              style={[
                styles.filterText,
                filter === 'all' && styles.activeFilterText
              ]}
            >
              Tümü
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filter === 'active' && styles.activeFilterButton
            ]}
            onPress={() => setFilter('active')}
          >
            <Text 
              style={[
                styles.filterText,
                filter === 'active' && styles.activeFilterText
              ]}
            >
              Aktif
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filter === 'completed' && styles.activeFilterButton
            ]}
            onPress={() => setFilter('completed')}
          >
            <Text 
              style={[
                styles.filterText,
                filter === 'completed' && styles.activeFilterText
              ]}
            >
              Tamamlanan
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {filteredTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>
            Görev bulunamadı
          </Text>
          <Text style={styles.emptyStateMessage}>
            Henüz görev eklemediniz veya aramanızla eşleşen görev yok.
          </Text>
          
          {/* Boş durumda gösterilen ekstra "Görev Oluştur" butonu */}
          <TouchableOpacity 
            style={styles.createTaskButton}
            onPress={handleCreateTask}
          >
            <Text style={styles.createTaskButtonText}>Görev Oluştur</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={[
            { type: 'overdue', data: overdueTasks },
            { type: 'today', data: todayTasks },
            { type: 'other', data: otherTasks }
          ]}
          keyExtractor={(item) => item.type}
          renderItem={({ item }) => {
            if (item.data.length === 0) return null;
            
            return (
              <View style={styles.section}>
                <SectionHeader
                  title={
                    item.type === 'overdue' ? 'Gecikmiş' :
                    item.type === 'today' ? 'Bugün' : 'Yaklaşan'
                  }
                  count={item.data.length}
                />
                {item.data.map((task: Task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </View>
            );
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary.main]}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* FAB (her zaman görünür) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateTask}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  searchBarContainer: {
    marginBottom: 16,
  },
  searchBar: {
    paddingHorizontal: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary.main,
  },
  filterText: {
    color: '#666666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 80,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  countBadge: {
    backgroundColor: COLORS.primary.light,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  // Yeni eklenen özel "Görev Oluştur" butonu
  createTaskButton: {
    backgroundColor: COLORS.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createTaskButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Düzgün yapılandırılmış + butonu
  fab: {
    position: 'absolute',
    bottom: 20, 
    right: 20,
    backgroundColor: COLORS.primary.main,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  },
  fabText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default TasksScreen;