// src/screens/StatsScreen.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNotes } from '../contexts/NotesContext';
import Animated, {
  FadeInDown,
  Layout,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_PADDING = 20;
const CHART_WIDTH = SCREEN_WIDTH - (CHART_PADDING * 2);

// Color palette for categories
const CATEGORY_COLORS = {
  'Work': '#4C6EF5',
  'Personal': '#82C91E',
  'Ideas': '#FD7E14',
  'Drawings': '#BE4BDB',
  'Other': '#868E96'
};

const StatsScreen = () => {
  const { notes } = useNotes();

  const stats = useMemo(() => {
    // General statistics
    const totalNotes = notes.length;
    const importantNotes = notes.filter(note => note.isImportant).length;
    const notesWithDrawings = notes.filter(note => note.drawings && note.drawings.length > 0).length;

    // Category-based statistics
    const categoryStats = notes.reduce((acc, note) => {
      acc[note.category] = (acc[note.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Time-based statistics
    const today = new Date();
    const last7Days = notes.filter(note => {
      const noteDate = new Date(note.createdAt);
      const diffTime = Math.abs(today.getTime() - noteDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length;

    const last30Days = notes.filter(note => {
      const noteDate = new Date(note.createdAt);
      const diffTime = Math.abs(today.getTime() - noteDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }).length;

    return {
      totalNotes,
      importantNotes,
      notesWithDrawings,
      categoryStats,
      last7Days,
      last30Days
    };
  }, [notes]);

  const renderCategoryStats = () => {
    const categories = Object.entries(stats.categoryStats).sort((a, b) => b[1] - a[1]);
    const maxValue = Math.max(...categories.map(([_, value]) => value));
    
    return categories.map(([category, count], index) => {
      const percentage = (count / stats.totalNotes) * 100;
      const barWidth = (count / maxValue) * 100;
      
      return (
        <Animated.View
          key={category}
          entering={FadeInDown.delay(index * 100)}
          style={styles.categoryItem}
        >
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#868E96' }]} />
            <Text style={styles.categoryName}>{category}</Text>
            <Text style={styles.categoryCount}>{count} notes</Text>
            <Text style={styles.categoryPercentage}>{percentage.toFixed(1)}%</Text>
          </View>
          <View style={styles.barContainer}>
            <View 
              style={[
                styles.bar,
                { 
                  width: `${barWidth}%`,
                  backgroundColor: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#868E96'
                }
              ]} 
            />
          </View>
        </Animated.View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Statistics</Text>
        <Text style={styles.subtitle}>Analyze your note-taking habits</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={styles.statsGrid}
        >
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalNotes}</Text>
            <Text style={styles.statLabel}>Total Notes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.importantNotes}</Text>
            <Text style={styles.statLabel}>Important Notes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.notesWithDrawings}</Text>
            <Text style={styles.statLabel}>Notes with Drawings</Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400)}
          style={styles.activityCard}
        >
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <View style={styles.activityStats}>
            <View style={styles.activityItem}>
              <Text style={styles.activityNumber}>{stats.last7Days}</Text>
              <Text style={styles.activityLabel}>Last 7 Days</Text>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityItem}>
              <Text style={styles.activityNumber}>{stats.last30Days}</Text>
              <Text style={styles.activityLabel}>Last 30 Days</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(600)}
          style={styles.categoriesCard}
        >
          <Text style={styles.cardTitle}>Category Distribution</Text>
          {renderCategoryStats()}
        </Animated.View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F8F9FF',
    borderRadius: 16,
    padding: 16,
    margin: 6,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4C6EF5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  activityStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  activityItem: {
    alignItems: 'center',
  },
  activityNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4C6EF5',
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 14,
    color: '#666666',
  },
  activityDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5E5',
  },
  categoriesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  categoryCount: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4C6EF5',
    minWidth: 60,
    textAlign: 'right',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default StatsScreen;