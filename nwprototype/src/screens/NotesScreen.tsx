// src/screens/NotesScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useNotes } from '../contexts/NotesContext';
import { useCategories } from '../contexts/CategoriesContext';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { CategoryFilter } from '../components/ui/CategoryFilter';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  FadeInDown,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { NoteCard } from '../components/notes/NoteCard';
import { EmptyState } from '../components/notes/EmptyState';
import { NotesHeader } from '../components/notes/NotesHeader';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';

const { height } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = Platform.OS === 'ios' ? 150 : 170;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 100 : 120;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const NotesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { notes, isLoading } = useNotes();
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);

  // Not filtreleme
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Scroll animasyonu handler'ı
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Header animasyon stilleri
  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE / 2],
      [1, 0],
      Extrapolate.CLAMP
    );

    return {
      height,
      opacity,
    };
  });

  // Yeni not oluşturma handler'ı
  const handleCreateNote = () => {
    navigation.navigate('NoteDetail', {});
  };

  // Yenileme handler'ı
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Yenileme işlemleri burada yapılabilir
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Animasyonlu Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <LinearGradient
          colors={[COLORS.primary.main, COLORS.primary.dark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <NotesHeader
          totalNotes={notes.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </Animated.View>

      {/* Kategori Filtreleri */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Not Listesi */}
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            progressViewOffset={HEADER_MAX_HEIGHT}
            colors={[COLORS.primary.main]}
            tintColor={COLORS.primary.main}
          />
        }
      >
        <View style={styles.notesContainer}>
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note, index) => (
              <Animated.View
                key={note.id}
                entering={FadeInDown.delay(index * 100).springify()}
              >
                <NoteCard
                  note={note}
                  category={categories.find(cat => cat.id === note.category)}
                  onPress={() => navigation.navigate('NoteDetail', {
                    noteId: note.id,
                    title: note.title,
                    content: note.content,
                    category: note.category,
                    isImportant: note.isImportant
                  })}
                />
              </Animated.View>
            ))
          ) : (
            <EmptyState
              query={searchQuery}
              selectedCategory={selectedCategory}
            />
          )}
        </View>
      </Animated.ScrollView>

      {/* Yeni Not Ekleme Butonu */}
      <FloatingActionButton
        onPress={handleCreateNote}
        style={styles.fab}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    backgroundColor: COLORS.primary.main,
    zIndex: 1000,
  },
  scrollContent: {
    paddingTop: HEADER_MAX_HEIGHT + SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  notesContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    ...SHADOWS.lg,
  },
});

export default NotesScreen;