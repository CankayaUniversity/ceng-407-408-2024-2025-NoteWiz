// src/screens/HomeScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
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
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useNotes } from '../contexts/NoteContext';
import { useAuth } from '../contexts/AuthContext';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { StatCard, ImportantNoteCard, RecentNoteCard } from '../components/home';
import { StarIcon, TimeIcon, NotesIcon, CloudIcon, SearchIcon, DocumentIcon, TaskIcon, ShareIcon, ImageIcon } from '../components/icons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { apiClient } from '../services/newApi';
import FriendRequestsScreen from './FriendRequestsScreen';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 340 : 360;

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { notes } = useNotes();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [friendCount, setFriendCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const { width: screenWidth } = useWindowDimensions();
  const statCardMargin = 20;
  const statCardCount = 4;
  const statCardWidth = (screenWidth - statCardMargin * (statCardCount - 1) - 40) / statCardCount; // 40: yatay padding

  const filteredNotes = notes;

  const importantNotes = filteredNotes.filter(note => note.isImportant);
  const recentNotes = [...filteredNotes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 2);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Burada yenileme işlemleri yapılabilir
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await apiClient.get('/friendship');
        setFriendCount(res.data.length);
      } catch (err) {
        setFriendCount(0);
      }
    };
    fetchFriends();
  }, []);

  const fetchRequestCount = async () => {
    try {
      const res = await apiClient.get('/friendship/requests');
      const pending = res.data.filter((r: any) => r.status === 'Pending');
      setRequestCount(pending.length);
    } catch (err) {
      setRequestCount(0);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchRequestCount();
    }, [])
  );

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
              width={statCardWidth}
            />
            <StatCard
              icon={<StarIcon size={24} color="#FFD700" />}
              number={importantNotes.length}
              label="Important"
              width={statCardWidth}
            />
            <StatCard
              icon={<TimeIcon size={24} color="#4A66D7" />}
              number={recentNotes.length}
              label="Recent"
              width={statCardWidth}
            />
            <StatCard
              icon={<StarIcon size={24} color="#4A66D7" />}
              number={friendCount}
              label="Friends"
              isLast={true}
              width={statCardWidth}
            />
          </ScrollView>

          <View style={styles.friendButtonsRow}>
            <TouchableOpacity
              style={styles.friendButton}
              onPress={() => navigation.navigate('FriendSearch')}
            >
              <Text style={styles.friendButtonText}>Arkadaş Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.friendButton}
              onPress={() => navigation.navigate('FriendsList')}
            >
              <Text style={styles.friendButtonText}>Arkadaşlarım</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.friendButton, { position: 'relative' }]}
              onPress={() => navigation.navigate('FriendRequests')}
            >
              <Text style={styles.friendButtonText}>Gelen İstekler</Text>
              {requestCount > 0 && (
                <View style={styles.requestBadge}>
                  <Text style={styles.requestBadgeText}>{requestCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ height: 8 }} />
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
                  key={`${note.id}_${index}`}
                  note={{
                    id: note.id.toString(),
                    title: note.title,
                    content: note.content,
                    category: note.tags?.[0] || 'other',
                    updatedAt: new Date(note.updatedAt)
                  }}
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
            {recentNotes.map((note, index) => {
              const category = note.tags?.[0] || 'other';
              const categoryColor = COLORS.categories[category as keyof typeof COLORS.categories] || COLORS.categories.other;
              return (
                <RecentNoteCard
                  key={`${note.id}_${index}`}
                  note={note}
                  index={index}
                  onPress={() => navigation.navigate('NoteDetail', { noteId: note.id })}
                  categoryColor={categoryColor}
                />
              );
            })}
          </View>
        </View>

        {/* <View style={styles.bottomSpacing} /> */}
      </ScrollView>

      <FloatingActionButton
        onPress={() => navigation.navigate('NoteDetail', {
          noteId: undefined,
          title: '',
          content: '',
          isImportant: false
        })}
        style={styles.fab}
      />

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('NoteDetail', {
            noteId: undefined,
            title: '',
            content: '',
            isImportant: false
          })}
        >
          <NotesIcon size={32} color={COLORS.primary.main} />
          <Text style={styles.cardText}>Yeni Not</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('DocumentUpload')}
        >
          <DocumentIcon size={32} color={COLORS.primary.main} />
          <Text style={styles.cardText}>Doküman Yükle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('TaskDetail', { taskId: undefined })}
        >
          <TaskIcon size={32} color={COLORS.primary.main} />
          <Text style={styles.cardText}>Görev Ekle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('SharedNotes')}
        >
          <ShareIcon size={32} color={COLORS.primary.main} />
          <Text style={styles.cardText}>Eş Zamanlı Notlar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('OCR')}
        >
          <ImageIcon size={32} color={COLORS.primary.main} />
          <Text style={styles.cardText}>Görselden Not</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('PdfList')}
        >
          <DocumentIcon size={32} color={COLORS.primary.main} />
          <Text style={styles.cardText}>PDF'lerim</Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: Platform.OS === 'ios' ? 20 : StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
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
    overflow: 'visible',
  },
  statsContent: {
    paddingRight: 20,
    overflow: 'visible',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 0,
  },
  section: {
    marginBottom: 12,
    paddingHorizontal: 20,
    marginTop: 8,
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
    height: 0,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
    paddingBottom: 20,
    gap: SPACING.lg,
  },
  card: {
    width: '30%',
    aspectRatio: 0.9,
    minHeight: 90,
    maxHeight: 120,
    marginBottom: 12,
    backgroundColor: COLORS.background.surface,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  cardText: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  title: {
    color: COLORS.text.primary,
    marginTop: 8,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#4C6EF5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 160,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  friendButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginHorizontal: 0,
  },
  friendButton: {
    flex: 1,
    backgroundColor: '#4C6EF5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  friendButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  requestBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  requestBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default HomeScreen;