import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Platform,
  StatusBar,
  Dimensions,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  Alert,
  ScrollView,
  TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Note, useNotes, FolderData } from '../contexts/NoteContext';
import { useCategories } from '../contexts/CategoriesContext';
import { CategoryFilter } from '../components/ui/CategoryFilter';
import { SearchBar } from '../components/ui/SearchBar';
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
import { CreateIcon, FolderIcon, DocumentIcon, ImageIcon, PdfIcon, CloseIcon, TrashIcon } from '../components/icons';
import { folderService } from '../services/folderService';
import { apiClient } from '../services/newApi';
import { getSummary } from '../services/openai';
import { Folder } from '../services/folderService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = Platform.OS === 'ios' ? 150 : 170;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 100 : 120;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// Color function for covers
const getColorFromId = (id: string): string => {
  const colors: Record<string, string> = {
    'generated': '#4C6EF5',
    'blue_sky': '#228BE6',
    'gradient_blue': '#15AABF',
    'pink_pattern': '#F06595',
    'green_nature': '#40C057'
  };
  return colors[id] || '#ADB5BD';
};

// We don't need an ExtendedNote interface anymore since the complete Note type
// is already defined in the NoteContext.tsx file
// The Note type already has userId, folderId, and isFolder properties

// We can use the Note interface for folders as well since the Note type 
// already includes isFolder and parentFolderId properties.
// Just creating a type alias for clarity
// type Folder = Note;

// UpdateCoverDTO should match the type definition from the noteService
// imported through the NoteContext
// This is already defined in the context and used in updateNoteCover function

// Since both notes and folders are now represented by the Note type,
// we can just use Note directly instead of a union type
type NoteOrFolder = Note;

const NotesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { 
    notes, 
    loading: isLoading, 
    addFolder, 
    moveNoteToFolder,
    updateNoteCover,
    loadNotes,
    deleteNote,
    updateNoteSummary
  } = useNotes();
  
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [showFABMenu, setShowFABMenu] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const scrollY = useSharedValue(0);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#4C6EF5');
  const [newFolderIcon, setNewFolderIcon] = useState('folder');
  const [folderColors, setFolderColors] = useState(['#4C6EF5','#FFD43B','#63E6BE','#FF8787','#845EF7','#FFA94D']);
  const [folderIcons, setFolderIcons] = useState(['folder','archive','star','description','insert-drive-file']);
  const [selectedFolderForAdd, setSelectedFolderForAdd] = useState<Folder | null>(null);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [selectedNotesToAdd, setSelectedNotesToAdd] = useState<string[]>([]);
  const [folderNoteCounts, setFolderNoteCounts] = useState<{ [key: string]: number }>({});
  const [summarizingNoteId, setSummarizingNoteId] = useState<string | null>(null);
  const [aiResponses, setAiResponses] = useState<{ [noteId: string]: string }>({});
  const [folders, setFolders] = useState<Folder[]>([]);
  const [hasPending, setHasPending] = useState(false);

  // Predefined cover options
  const coverOptions = [
    { id: 'none', title: 'No Cover', image: null as null },
    { id: 'generated', title: 'AI Generated', image: null as null, color: getColorFromId('generated') },
    { id: 'blue_sky', title: 'Blue Sky', image: null as null, color: getColorFromId('blue_sky') },
    { id: 'gradient_blue', title: 'Blue Gradient', image: null as null, color: getColorFromId('gradient_blue') },
    { id: 'pink_pattern', title: 'Pink Pattern', image: null as null, color: getColorFromId('pink_pattern') },
    { id: 'green_nature', title: 'Nature', image: null as null, color: getColorFromId('green_nature') },
  ];

  // All notes and folders in the current directory
  const getCurrentItems = useCallback((): NoteOrFolder[] => {
    if (currentFolder === null) {
      return notes; // Kök dizindeyken tüm notlar ve klasörler
    }
    let items: NoteOrFolder[] = [];
    items = notes.filter(note => {
      const noteFolderId = note.folderId !== undefined && note.folderId !== null ? String(note.folderId) : '';
      return noteFolderId === currentFolder;
    });
    // Duplicate'ları kaldır (id'ye göre tekilleştir)
    return Array.from(new Map(items.map(note => [note.id, note])).values());
  }, [notes, currentFolder]);

  // Filter notes based on search and category
  const getFilteredItems = useCallback((): NoteOrFolder[] => {
    const currentItems = getCurrentItems();
    
    return currentItems.filter(item => {
      const isFolder = 'isFolder' in item && item.isFolder;
      
      if (isFolder) {
        return (item.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      const matchesSearch = 
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        ((item.content || '').toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [getCurrentItems, searchQuery, selectedCategory]);

  // Sort items: folders first, then notes sorted by updated date
  const sortedItems = useCallback((): NoteOrFolder[] => {
    const filtered = getFilteredItems();
    
    return [...filtered].sort((a, b) => {
      if ('isFolder' in a && 'isFolder' in b) {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
      } else if ('isFolder' in a && a.isFolder) {
        return -1;
      } else if ('isFolder' in b && b.isFolder) {
        return 1;
      }
      
      const aDate = new Date(a.updatedAt).getTime();
      const bDate = new Date(b.updatedAt).getTime();
      return bDate - aDate;
    });
  }, [getFilteredItems]);

  // Scroll handler for the animated header
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Header animation
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

  // Handle refreshing
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Perform your refresh operations here
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Handle navigating into a folder
  const handleFolderPress = (folderId: string | number, folderTitle: string) => {
    // folderId'yi string'e çevir
    const folderIdString = folderId.toString();
    setCurrentFolder(folderIdString);
  };

  // Handle navigation back to parent folder
  const handleNavigateBack = () => {
    if (currentFolder) {
      const currentFolderObj = notes.find(n => n.id.toString() === currentFolder && n.isFolder);
      if (currentFolderObj && currentFolderObj.parentFolderId) {
        // parentFolderId'yi string'e çevir
        setCurrentFolder(currentFolderObj.parentFolderId.toString());
      } else {
        setCurrentFolder(null);
      }
    }
  };

  // Handle opening the FAB menu
  const toggleFABMenu = () => {
    setShowFABMenu(!showFABMenu);
  };

  // Handle creating a new note
  const handleCreateNote = () => {
    setShowFABMenu(false);
    navigation.navigate('NoteDetail', { folderId: currentFolder });
  };

  // Handle creating a new folder
  const handleCreateFolder = () => {
    setShowFABMenu(false);
    // Using a different approach for Alert.prompt which may not be defined on all platforms
    // This is a simplified version - you might need to implement a custom prompt dialog
    Alert.alert(
      'New Folder',
      'Enter a name for the new folder:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Create',
          onPress: () => {
            // Simplified: normally you'd get user input here
            const folderName = "New Folder"; // Replace with actual user input
            if (folderName && folderName.trim()) {
              const folderData: FolderData = {
                title: folderName.trim(),
                parentFolderId: currentFolder ? Number(currentFolder) : null,
                isFolder: true,
              };
              addFolder(folderData);
            }
          },
        },
      ]
    );
  };

  // Handle importing a file
  const handleImportFile = () => {
    setShowFABMenu(false);
    // Implement file import logic here
    Alert.alert('Import File', 'File import feature is coming soon!');
  };

  // Handle picking a PDF
  const handlePickPdf = () => {
    setShowFABMenu(false);
    navigation.navigate('NoteDetail', {
      folderId: currentFolder,
      noteId: undefined,
      title: undefined,
      content: undefined,
      category: undefined,
      isImportant: undefined,
      color: undefined,
      tags: undefined
    });
  };

  // Handle selecting a cover for a note
  const handleCoverSelect = (noteItem: Note | null, coverId: string) => {
    setShowCoverPicker(false);
    
    if (!noteItem) return;
    
    if (coverId === 'none') {
      updateNoteCover(noteItem.id, { coverType: undefined, coverPosition: undefined, color: undefined });
    } else if (coverId === 'generated') {
      Alert.alert(
        'AI Cover Generator',
        'AI is generating a cover...',
        [
          {
            text: 'OK',
            onPress: () => {
              // Randomly select one of the predefined covers as a placeholder
              const randomCover = coverOptions.filter(c => c.id !== 'none' && c.id !== 'generated');
              const selectedCover = randomCover[Math.floor(Math.random() * randomCover.length)];
              // Use the color for the UpdateCoverDTO
              updateNoteCover(noteItem.id, { color: selectedCover.color });
            },
          },
        ]
      );
    } else {
      const selectedCover = coverOptions.find(c => c.id === coverId);
      if (selectedCover) {
        updateNoteCover(noteItem.id, { color: selectedCover.color });
      }
    }
  };

  // Generate AI cover based on note content or title
  const generateAICover = (noteId: string, sourceType: 'title' | 'content') => {
    const note = notes.find(n => n.id.toString() === noteId);
    if (!note) return;
    
    // This would connect to an AI service in a real implementation
    // For now, we'll just simulate it
    Alert.alert(
      'AI Cover Generator',
      `Generating cover based on note ${sourceType}...`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Randomly select one of the predefined covers as a placeholder
            const randomCover = coverOptions.filter(c => c.id !== 'none' && c.id !== 'generated');
            const selectedCover = randomCover[Math.floor(Math.random() * randomCover.length)];
            // Use the color for the UpdateCoverDTO
            updateNoteCover(note.id, { color: selectedCover.color });
          },
        },
      ]
    );
  };

  // Handle note selection (for cover picking, etc.)
  const handleNoteOptions = (noteId: string) => {
    const note = notes.filter(n => n.id.toString() === noteId)[0];
    if (!note) return;
    
    // Show options menu
    Alert.alert(
      'Note Options',
      note.title,
      [
        {
          text: 'Change Cover',
          onPress: () => {
            setSelectedNoteId(noteId);
            setShowCoverPicker(true);
          },
        },
        {
          text: 'Move to Folder',
          onPress: () => handleMoveToFolder(note.id),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Handle moving a note to a folder
  const handleMoveToFolder = (noteId: string | number) => {
    // Implement folder selection UI here
    // For now, we'll use a simple alert
    Alert.alert(
      'Move to Folder',
      'Select destination folder:',
      [
        {
          text: 'Root',
          onPress: () => moveNoteToFolder(noteId, null),
        },
        // You'd dynamically generate folder options here
        // For each folder in your system
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Klasörleri backend'den çek
  const loadFolders = useCallback(async () => {
    try {
      const data = await folderService.getFolders();
      setFolders(data);
    } catch (err) {
      setFolders([]);
    }
  }, []);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  // Klasör ekleme fonksiyonu
  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await folderService.addFolder(newFolderName, newFolderColor);
      await loadFolders();
      setShowAddFolderModal(false);
      setNewFolderName('');
      setNewFolderColor('#4C6EF5');
      setNewFolderIcon('folder');
    } catch (err) {
      Alert.alert('Klasör eklenemedi', 'Bir hata oluştu.');
    }
  };

  // Klasör silme fonksiyonu
  const handleDeleteFolder = async (folderId: string) => {
    // Önce UI'dan hemen kaldır
    const prevFolders = [...folders];
    setFolders(folders.filter(f => f.id !== folderId));
    try {
      await folderService.deleteFolder(Number(folderId));
      // Başarılıysa bir şey yapmaya gerek yok
    } catch (err) {
      Alert.alert('Klasör silinemedi', 'Bir hata oluştu.');
      setFolders(prevFolders); // Hata olursa eski state'i geri yükle
    }
  };

  // Klasöre eklenebilecek notları bul
  const getAvailableNotesForFolder = (folderId: string) => {
    return notes.filter(n => !n.folderId && !n.isFolder);
  };

  // Klasöre not ekle
  const handleAddNotesToFolder = async (folder: Folder) => {
    for (const noteId of selectedNotesToAdd) {
      await moveNoteToFolder(noteId, folder.id);
    }
    await loadNotes();
    await loadFolders();
    setSelectedNotesToAdd([]);
    setSelectedFolderForAdd(null);
    setShowAddNoteModal(false);
  };

  // Klasörden not çıkar
  const handleRemoveNoteFromFolder = async (noteId: string) => {
    await moveNoteToFolder(noteId, null);
    await loadNotes();
    await loadFolders();
  };

  // Klasör not sayılarını backend'den çek
  useEffect(() => {
    const fetchCounts = async () => {
      const counts: { [key: string]: number } = {};
      for (const folder of folders) {
        try {
          const res = await apiClient.get(`/folder/${folder.id}/notes`);
          counts[folder.id] = Array.isArray(res.data) ? res.data.length : 0;
        } catch {
          counts[folder.id] = 0;
        }
      }
      setFolderNoteCounts(counts);
    };
    fetchCounts();
  }, [folders, notes]);

  // Render header with breadcrumb navigation
  const renderHeader = () => {
    // Build breadcrumb trail
    let breadcrumbs: Note[] = [];
    let currentId = currentFolder;
    
    if (currentId) {
      while (currentId) {
        const folder = notes.find(n => n.id.toString() === currentId && n.isFolder) as Note | undefined;
        if (folder) {
          breadcrumbs.unshift(folder);
          currentId = folder.parentFolderId?.toString() || null;
        } else {
          break;
        }
      }
    }
    
    return (
      <View style={styles.breadcrumbContainer}>
        <TouchableOpacity 
          style={styles.breadcrumbItem} 
          onPress={() => setCurrentFolder(null)}
        >
          <Text style={[
            styles.breadcrumbText,
            !currentFolder && styles.breadcrumbActive
          ]}>
            Home
          </Text>
        </TouchableOpacity>
        
        {breadcrumbs.map((folder, index) => (
          <View key={folder.id} style={styles.breadcrumbRow}>
            <Text style={styles.breadcrumbSeparator}>/</Text>
            <TouchableOpacity 
              style={styles.breadcrumbItem}
              onPress={() => setCurrentFolder(folder.id.toString())}
            >
              <Text style={[
                styles.breadcrumbText,
                index === breadcrumbs.length - 1 && styles.breadcrumbActive
              ]}>
                {folder.title}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  // Klasörsüz notları belirleyen yardımcı fonksiyon
  const isFolderless = (note: any) => {
    //console.log('[Klasörsüz Notlar DEBUG]', 'note.id:', note.id, 'title:', note.title, 'folderId:', note.folderId, 'typeof:', typeof note.folderId);
    if (note.isFolder) return false;
    // folderId'yi normalize et
    let folderId = note.folderId;
    if (typeof folderId === 'string') folderId = folderId.trim();
    return (
      folderId === null ||
      folderId === undefined ||
      folderId === '' ||
      folderId === 0 ||
      folderId === '0' ||
      folderId === 'null'
    );
  };

  // Pending not/çizim kontrolü
  useEffect(() => {
    const checkPending = async () => {
      const pendingNotes = await AsyncStorage.getItem('pendingNotes');
      const pendingDrawings = await AsyncStorage.getItem('pendingDrawings');
      const hasPendingNotes = pendingNotes && JSON.parse(pendingNotes).length > 0;
      const hasPendingDrawings = pendingDrawings && JSON.parse(pendingDrawings).length > 0;
      setHasPending(!!hasPendingNotes || !!hasPendingDrawings);
    };
    checkPending();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      {/* Pending uyarı bannerı */}
      {hasPending && (
        <View style={{ backgroundColor: '#FFD43B', padding: 10, alignItems: 'center' }}>
          <Text style={{ color: '#333', fontWeight: 'bold' }}>Bekleyen not veya çizim(ler) var. İnternete bağlanınca otomatik olarak gönderilecek.</Text>
        </View>
      )}

      {/* Animated Header */}
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

      {/* Breadcrumb Navigation */}
      {renderHeader()}

      {/* Category Filter */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 4 }}>
        <Text style={{ color: '#4C6EF5', fontSize: 13, marginRight: 8 }}> Kategoriye göre Filtrele:</Text>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent}>
        {/* Klasörler */}
        {currentFolder === null && (
          <View style={{ marginBottom: 24 }}>
            {folders.length > 0 && (
              <Text style={{ fontWeight: 'bold', fontSize: 17, marginBottom: 8 }}>Klasörler</Text>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }} contentContainerStyle={{ alignItems: 'center', paddingVertical: 4 }}>
              {folders.map(folder => {
                console.log('folder:', folder);
                return (
                  <View key={folder.id} style={{
                    width: 90,
                    alignItems: 'center',
                    marginRight: 16,
                    backgroundColor: '#f4f6fa',
                    borderRadius: 12,
                    padding: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: 2
                  }}>
                    <TouchableOpacity 
                      style={{ alignItems: 'center' }}
                      onPress={() => navigation.navigate('FolderDetail', { folderId: folder.id.toString() })}
                    >
                      {/* Klasör ikonu */}
                      {folder.icon && typeof folder.icon === 'string' ? (
                        <Icon name={folder.icon} size={32} color={folder.color || COLORS.primary.main} />
                      ) : (
                        <FolderIcon size={32} color={folder.color || COLORS.primary.main} />
                      )}
                      <Text style={{ fontSize: 13, fontWeight: 'bold', marginTop: 6, textAlign: 'center' }}>{folder.name}</Text>
                      {/* Not sayısı badge */}
                      <View style={{ backgroundColor: '#228be6', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', marginTop: 2, paddingHorizontal: 6 }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>{folderNoteCounts[folder.id] ?? 0}</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteFolder(String(folder.id))} style={{ marginTop: 2 }}>
                      <Text style={{ color: '#FA5252', fontSize: 12 }}>Sil</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
              {/* Artı butonu klasörlerin hemen yanında */}
              <TouchableOpacity 
                style={[styles.addButton, { marginRight: 8 }]}
                onPress={() => setShowAddFolderModal(true)}
              >
                <CreateIcon size={24} color={COLORS.primary.main} />
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
        {/* Klasörsüz Notlar yerine Tüm Notlar başlığıyla, currentFolder === null iken tüm notları göster */}
        {currentFolder === null && sortedItems().filter(note => !note.isFolder).length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 17 }}>
                {searchQuery ? 'Arama Sonuçları' : 'Tüm Notlar'}
              </Text>
              <TouchableOpacity
                style={{ alignItems: 'center' }}
                onPress={handleCreateNote}
              >
                <CreateIcon size={28} color={COLORS.primary.main} />
                <Text style={{ color: COLORS.primary.main, fontSize: 13, marginTop: 2 }}>Not Ekle</Text>
              </TouchableOpacity>
            </View>
            {sortedItems().filter(note => !note.isFolder).map(note => (
              <View key={note.id} style={{ position: 'relative', marginBottom: 8 }}>
                <NoteCard
                  note={{
                    id: note.id.toString(),
                    title: note.title,
                    content: note.content || '',
                    isImportant: note.isPinned || false,
                    updatedAt: new Date(note.updatedAt),
                    isPdf: note.isPdf,
                    pdfUrl: note.pdfUrl,
                    pdfName: note.pdfName,
                    coverImage: note.coverImage && note.coverImage.uri ? { uri: note.coverImage.uri } : undefined
                  }}
                  category={{
                    id: note.category?.toString() || '',
                    name: categories.find(c => c.id.toString() === note.category?.toString())?.name || '',
                    color: categories.find(c => c.id.toString() === note.category?.toString())?.color
                  }}
                  onPress={() => navigation.navigate('NoteDetail', { noteId: note.id.toString() })}
                />
                {/* Özetle butonu ve özet gösterimi */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, marginLeft: 8 }}>
                  <TouchableOpacity
                    style={{ backgroundColor: '#4C6EF5', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12, alignSelf: 'flex-start', opacity: summarizingNoteId === note.id ? 0.6 : 1 }}
                    onPress={async () => {
                      setSummarizingNoteId(note.id);
                      try {
                        const summary = await getSummary(note.content + '\nözetle');
                        setAiResponses(prev => ({ ...prev, [note.id]: summary }));
                      } catch (e) {
                        Alert.alert('Özet alınamadı', 'Bir hata oluştu.');
                      } finally {
                        setSummarizingNoteId(null);
                      }
                    }}
                    disabled={summarizingNoteId === note.id}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{summarizingNoteId === note.id ? 'Özetleniyor...' : 'Özetle'}</Text>
                  </TouchableOpacity>
                  {aiResponses[note.id] && (
                    <Text style={{ fontSize: 12, color: '#228be6', marginLeft: 8, fontStyle: 'italic', maxWidth: 180 }} numberOfLines={1} ellipsizeMode="tail">
                      {aiResponses[note.id]}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, backgroundColor: '#fff', borderRadius: 16, padding: 6, elevation: 2 }}
                  onPress={async () => {
                    Alert.alert('Notu Sil', 'Bu notu silmek istediğine emin misin?', [
                      { text: 'İptal', style: 'cancel' },
                      { text: 'Sil', style: 'destructive', onPress: async () => { await deleteNote(note.id); await loadNotes(); } }
                    ]);
                  }}
                >
                  <TrashIcon size={20} color="#FA5252" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        {/* Eğer klasör içindeysek sadece o klasörün notlarını göster */}
        {currentFolder !== null && (
          <View style={{ marginBottom: 24 }}>
            {sortedItems().filter(note => !note.isFolder).length > 0 ? (
              sortedItems().filter(note => !note.isFolder).map(note => (
                <View key={note.id} style={{ position: 'relative', marginBottom: 8 }}>
                  <NoteCard
                    note={{
                      id: note.id.toString(),
                      title: note.title,
                      content: note.content || '',
                      isImportant: note.isPinned || false,
                      updatedAt: new Date(note.updatedAt),
                      isPdf: note.isPdf,
                      pdfUrl: note.pdfUrl,
                      pdfName: note.pdfName,
                      coverImage: note.coverImage && note.coverImage.uri ? { uri: note.coverImage.uri } : undefined
                    }}
                    category={{
                      id: note.category?.toString() || '',
                      name: categories.find(c => c.id.toString() === note.category?.toString())?.name || '',
                      color: categories.find(c => c.id.toString() === note.category?.toString())?.color
                    }}
                    onPress={() => navigation.navigate('NoteDetail', { noteId: note.id.toString() })}
                  />
                  {/* Özetle butonu ve özet gösterimi */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, marginLeft: 8 }}>
                    <TouchableOpacity
                      style={{ backgroundColor: '#4C6EF5', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12, alignSelf: 'flex-start', opacity: summarizingNoteId === note.id ? 0.6 : 1 }}
                      onPress={async () => {
                        setSummarizingNoteId(note.id);
                        try {
                          const summary = await getSummary(note.content + '\nözetle');
                          setAiResponses(prev => ({ ...prev, [note.id]: summary }));
                        } catch (e) {
                          Alert.alert('Özet alınamadı', 'Bir hata oluştu.');
                        } finally {
                          setSummarizingNoteId(null);
                        }
                      }}
                      disabled={summarizingNoteId === note.id}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>{summarizingNoteId === note.id ? 'Özetleniyor...' : 'Özetle'}</Text>
                    </TouchableOpacity>
                    {aiResponses[note.id] && (
                      <Text style={{ fontSize: 12, color: '#228be6', marginLeft: 8, fontStyle: 'italic', maxWidth: 180 }} numberOfLines={1} ellipsizeMode="tail">
                        {aiResponses[note.id]}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, backgroundColor: '#fff', borderRadius: 16, padding: 6, elevation: 2 }}
                    onPress={async () => {
                      Alert.alert('Notu Sil', 'Bu notu silmek istediğine emin misin?', [
                        { text: 'İptal', style: 'cancel' },
                        { text: 'Sil', style: 'destructive', onPress: async () => { await deleteNote(note.id); await loadNotes(); } }
                      ]);
                    }}
                  >
                    <TrashIcon size={20} color="#FA5252" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={{ color: '#888', fontStyle: 'italic' }}>Bu klasörde hiç not yok.</Text>
            )}
          </View>
        )}
        {notes.filter(isFolderless).length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 17 }}>Klasörsüz Notlar</Text>
              <TouchableOpacity
                style={{ alignItems: 'center' }}
                onPress={handleCreateNote}
              >
                <CreateIcon size={28} color={COLORS.primary.main} />
                <Text style={{ color: COLORS.primary.main, fontSize: 13, marginTop: 2 }}>Not Ekle</Text>
              </TouchableOpacity>
            </View>
            {notes.filter(isFolderless).map(note => (
              <View key={note.id} style={{ position: 'relative', marginBottom: 8 }}>
                <NoteCard
                  note={{
                    id: note.id.toString(),
                    title: note.title,
                    content: note.content || '',
                    isImportant: note.isPinned || false,
                    updatedAt: new Date(note.updatedAt),
                    isPdf: note.isPdf,
                    pdfUrl: note.pdfUrl,
                    pdfName: note.pdfName,
                    coverImage: note.coverImage && note.coverImage.uri ? { uri: note.coverImage.uri } : undefined
                  }}
                  category={{
                    id: note.category?.toString() || '',
                    name: categories.find(c => c.id.toString() === note.category?.toString())?.name || '',
                    color: categories.find(c => c.id.toString() === note.category?.toString())?.color
                  }}
                  onPress={() => navigation.navigate('NoteDetail', { noteId: note.id.toString() })}
                />
                {/* Özetle butonu ve özet gösterimi */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, marginLeft: 8 }}>
                  <TouchableOpacity
                    style={{ backgroundColor: '#4C6EF5', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12, alignSelf: 'flex-start', opacity: summarizingNoteId === note.id ? 0.6 : 1 }}
                    onPress={async () => {
                      setSummarizingNoteId(note.id);
                      try {
                        const summary = await getSummary(note.content + '\nözetle');
                        setAiResponses(prev => ({ ...prev, [note.id]: summary }));
                      } catch (e) {
                        Alert.alert('Özet alınamadı', 'Bir hata oluştu.');
                      } finally {
                        setSummarizingNoteId(null);
                      }
                    }}
                    disabled={summarizingNoteId === note.id}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{summarizingNoteId === note.id ? 'Özetleniyor...' : 'Özetle'}</Text>
                  </TouchableOpacity>
                  {aiResponses[note.id] && (
                    <Text style={{ fontSize: 12, color: '#228be6', marginLeft: 8, fontStyle: 'italic', maxWidth: 180 }} numberOfLines={1} ellipsizeMode="tail">
                      {aiResponses[note.id]}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, backgroundColor: '#fff', borderRadius: 16, padding: 6, elevation: 2 }}
                  onPress={async () => {
                    Alert.alert('Notu Sil', 'Bu notu silmek istediğine emin misin?', [
                      { text: 'İptal', style: 'cancel' },
                      { text: 'Sil', style: 'destructive', onPress: async () => { await deleteNote(note.id); await loadNotes(); } }
                    ]);
                  }}
                >
                  <TrashIcon size={20} color="#FA5252" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB Menu */}
      {/* FAB veya sağ alt köşedeki artı butonunu kaldır */}

      {/* Klasör ekleme modalı */}
      <Modal visible={showAddFolderModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, minWidth: 280, maxWidth: 340 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Klasör Ekle</Text>
            <TextInput
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="Klasör adı"
              style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, marginBottom: 12 }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              {folderColors.map(color => (
                <TouchableOpacity
                  key={color}
                  style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: color, marginHorizontal: 4, borderWidth: newFolderColor === color ? 2 : 0, borderColor: '#222' }}
                  onPress={() => setNewFolderColor(color)}
                />
              ))}
              {folderIcons.map(icon => (
                <TouchableOpacity key={icon} onPress={() => setNewFolderIcon(icon)} style={{ marginHorizontal: 4 }}>
                  <Icon name={icon} size={22} color={newFolderIcon === icon ? '#222' : '#AAA'} />
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              <TouchableOpacity onPress={() => setShowAddFolderModal(false)} style={{ marginRight: 16 }}>
                <Text style={{ color: '#888' }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddFolder}>
                <Text style={{ color: '#4C6EF5', fontWeight: 'bold' }}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Klasöre not ekleme modalı */}
      <Modal visible={showAddNoteModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, minWidth: 280, maxWidth: 340 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Notları Klasöre Ekle</Text>
            <ScrollView style={{ maxHeight: 220 }}>
              {selectedFolderForAdd && getAvailableNotesForFolder(selectedFolderForAdd.id).map(note => (
                <TouchableOpacity
                  key={note.id}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
                  onPress={() => setSelectedNotesToAdd(prev => prev.includes(note.id) ? prev.filter(id => id !== note.id) : [...prev, note.id])}
                >
                  <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#4C6EF5', marginRight: 12, backgroundColor: selectedNotesToAdd.includes(note.id) ? '#4C6EF5' : '#fff', justifyContent: 'center', alignItems: 'center' }}>
                    {selectedNotesToAdd.includes(note.id) && (
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>✓</Text>
                    )}
                  </View>
                  <Text style={{ fontSize: 16 }}>{note.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <TouchableOpacity onPress={() => setShowAddNoteModal(false)} style={{ marginRight: 16 }}>
                <Text style={{ color: '#888' }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => selectedFolderForAdd && handleAddNotesToFolder(selectedFolderForAdd)} disabled={selectedNotesToAdd.length === 0}>
                <Text style={{ color: selectedNotesToAdd.length === 0 ? '#AAA' : '#4C6EF5', fontWeight: 'bold' }}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background.paper,
    marginTop: HEADER_MAX_HEIGHT,
    zIndex: 1,
    flexWrap: 'wrap',
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  breadcrumbText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  breadcrumbActive: {
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  breadcrumbSeparator: {
    color: COLORS.text.secondary,
    marginHorizontal: 2,
  },
  listContent: {
    paddingTop: 16,
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  folderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.paper,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  folderInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  folderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  folderMeta: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  fabMenu: {
    position: 'absolute',
    bottom: SPACING.xl + 70,
    right: SPACING.xl,
    zIndex: 1000,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.paper,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    ...SHADOWS.md,
  },
  fabMenuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fabMenuText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.background.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.md,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  coverOption: {
    flex: 1,
    alignItems: 'center',
    margin: SPACING.sm,
  },
  coverPreview: {
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  noCoverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCoverText: {
    color: COLORS.text.secondary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  coverTitle: {
    fontSize: 14,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});

export default NotesScreen;
