// src/screens/HomeScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useNotes } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { StatCard, ImportantNoteCard, RecentNoteCard } from '../components/home';
import { StarIcon, TimeIcon, NotesIcon, CloudIcon, SearchIcon } from '../components/icons';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 280 : 300;

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { notes, isLoading } = useNotes();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredNotes = notes.filter(note => {
    const lowerSearchQuery = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(lowerSearchQuery) ||
      note.content.toLowerCase().includes(lowerSearchQuery)
    );
  });

  const importantNotes = filteredNotes.filter(note => note.isImportant);
  const recentNotes = [...filteredNotes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Burada yenileme işlemleri yapılabilir
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A66D7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.header}>
        <LinearGradient
          colors={['#4B6FEF', '#3E59DB']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0.8}}
          locations={[0.3, 0.8]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          <View style={styles.userSection}>
            <TouchableOpacity style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.fullName?.[0]?.toUpperCase() || '?'}
              </Text>
            </TouchableOpacity>
            <View style={styles.welcomeText}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.username}>
                {user?.fullName?.split(' ')[0] || 'User'} 👋
              </Text>
            </View>
          </View>

          <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
              <SearchIcon size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search your notes..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statsContainer}
            contentContainerStyle={styles.statsContent}
          >
            <StatCard
              icon={<NotesIcon size={24} color="#4A66D7" />}
              number={notes.length}
              label="Total Notes"
            />
            <StatCard
              icon={<StarIcon size={24} color="#FFD700" />}
              number={importantNotes.length}
              label="Important"
            />
            <StatCard
              icon={<TimeIcon size={24} color="#4A66D7" />}
              number={recentNotes.length}
              label="Recent"
            />
          </ScrollView>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            progressViewOffset={HEADER_HEIGHT}
          />
        }
      >
        {importantNotes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Important Notes</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.importantNotesContainer}
            >
              {importantNotes.map((note, index) => (
                <ImportantNoteCard
                  key={note.id}
                  note={note}
                  index={index}
                  onPress={() => navigation.navigate('NoteDetail', { noteId: note.id })}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Notes</Text>
          <View style={styles.recentNotesGrid}>
            {recentNotes.map((note, index) => (
              <RecentNoteCard
                key={note.id}
                note={note}
                index={index}
                onPress={() => navigation.navigate('NoteDetail', { noteId: note.id })}
              />
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FloatingActionButton
        onPress={() => navigation.navigate('NoteDetail', {})}
        style={styles.fab}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
  },
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: '#4A66D7',
    zIndex: 1,
  },
  headerContent: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 20 : StatusBar.currentHeight! + 20,
    paddingHorizontal: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  welcomeText: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchBarContainer: {
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsContent: {
    paddingRight: 20,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  scrollContent: {
    paddingTop: 24,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  importantNotesContainer: {
    paddingRight: 20,
  },
  recentNotesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  bottomSpacing: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
});

export default HomeScreen;