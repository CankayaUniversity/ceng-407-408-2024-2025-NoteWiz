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
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
import { CreateIcon, FolderIcon, DocumentIcon, ImageIcon, PdfIcon, CloseIcon } from '../components/icons';

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
type Folder = Note;

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
    updateNoteCover 
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
      return notes.filter(note => !note.folderId);
    } else {
      return notes.filter(note => {
        let noteFolderId: string | null = null;
        if (typeof note.folderId === 'number') noteFolderId = String(note.folderId);
        else if (typeof note.folderId === 'string') noteFolderId = note.folderId;
        else noteFolderId = null;
        return noteFolderId === currentFolder;
      });
    }
  }, [notes, currentFolder]);

  // Filter notes based on search and category
  const getFilteredItems = useCallback((): NoteOrFolder[] => {
    const currentItems = getCurrentItems();
    
    return currentItems.filter(item => {
      const isFolder = 'isFolder' in item && item.isFolder;
      
      if (isFolder) {
        return item.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.content?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      
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
      const currentFolderObj = notes.find(n => n.id.toString() === currentFolder && n.isFolder) as Note | undefined;
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
    navigation.navigate('NoteDetail', {
      title: '',
      content: '',
      category: '',
      isImportant: false,
      color: '',
      folderId: null
    });
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
      folderId: currentFolder ?? undefined,
      noteId: undefined,
      title: undefined,
      content: undefined,
      category: undefined,
      isImportant: undefined,
      color: undefined
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
        'Would you like to generate a cover based on note title or content?',
        [
          {
            text: 'Title',
            onPress: () => generateAICover(noteItem.id.toString(), 'title'),
          },
          {
            text: 'Content',
            onPress: () => generateAICover(noteItem.id.toString(), 'content'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
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
    const note = notes.find(n => n.id.toString() === noteId);
    if (!note) return;
    
    // Show options menu
    Alert.alert(
      'Note Options',
      `${note.title}`,
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

  const handleEditNote = (note: Note) => {
    navigation.navigate('NoteDetail', {
      noteId: typeof note.id === 'string' ? parseInt(note.id) : note.id,
      title: note.title,
      content: note.content,
      category: note.category,
      isImportant: note.isPinned || false,
      color: note.category,
      folderId: (typeof note.folderId === 'number') ? String(note.folderId) : (typeof note.folderId === 'string' ? note.folderId : null)
    });
  };

  const handleShareNote = (note: Note) => {
    navigation.navigate('ShareNote', {
      noteId: typeof note.id === 'string' ? parseInt(note.id) : note.id
    });
  };

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

  // Render note or folder item
  const renderItem = ({ item, index }: { item: Note; index: number }) => {
    if (item.isFolder) {
      return (
        <Animated.View
          entering={FadeInDown.delay(index * 50).springify()}
        >
          <TouchableOpacity
            style={styles.folderCard}
            onPress={() => handleFolderPress(item.id, item.title)}
          >
            <FolderIcon size={36} color={COLORS.primary.main} />
            <View style={styles.folderInfo}>
              <Text style={styles.folderTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.folderMeta}>
                {notes.filter(n => {
                  let noteFolderId: string | null = null;
                  if (typeof n.folderId === 'number') noteFolderId = String(n.folderId);
                  else if (typeof n.folderId === 'string') noteFolderId = n.folderId;
                  else noteFolderId = null;
                  let itemIdStr = '';
                  if (typeof item.id === 'number') itemIdStr = String(item.id);
                  else if (typeof item.id === 'string') itemIdStr = item.id;
                  else itemIdStr = '';
                  return noteFolderId === itemIdStr;
                }).length} items • {new Date(item.updatedAt).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    // It's a note
    const categoryObj = categories.find(cat => {
      if (typeof cat.id === 'number' && typeof item.category === 'string') {
        return String(cat.id) === item.category;
      }
      if (typeof cat.id === 'string' && typeof item.category === 'string') {
        return cat.id === item.category;
      }
      if (typeof cat.id === 'number' && typeof item.category === 'number') {
        return cat.id === item.category;
      }
      return false;
    });
    
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).springify()}
      >
        <NoteCard
          note={{
            id: item.id.toString(),
            title: item.title,
            content: item.content || '',
            isImportant: item.isPinned || false,
            updatedAt: new Date(item.updatedAt),
            isPdf: item.isPdf,
            pdfUrl: item.pdfUrl,
            pdfName: item.pdfName,
            coverImage: item.coverImage
          }}
          category={{
            id: categoryObj?.id?.toString() || '',
            name: categoryObj?.name || '',
            color: categoryObj?.color
          }}
          onPress={() => handleEditNote(item)}
          onLongPress={() => handleNoteOptions(item.id.toString())}
        />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

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
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Notes and Folders List */}
      <FlatList
        data={sortedItems()}
        keyExtractor={(item: Note) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            progressViewOffset={HEADER_MAX_HEIGHT + 60}
            colors={[COLORS.primary.main]}
            tintColor={COLORS.primary.main}
          />
        }
        ListEmptyComponent={
          <EmptyState
            query={searchQuery}
            selectedCategory={selectedCategory}
          />
        }
      />

      {/* FAB Menu */}
      <TouchableOpacity
        style={styles.fab}
        onPress={toggleFABMenu}
      >
        {showFABMenu ? (
          <CloseIcon size={24} color="#FFFFFF" />
        ) : (
          <CreateIcon size={24} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      {/* FAB Menu Options */}
      {showFABMenu && (
        <View style={styles.fabMenu}>
          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={handleCreateNote}
          >
            <View style={[styles.fabMenuIcon, { backgroundColor: '#4C6EF5' }]}>
              <DocumentIcon size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.fabMenuText}>New Note</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={handlePickPdf}
          >
            <View style={[styles.fabMenuIcon, { backgroundColor: '#FA5252' }]}>
              <PdfIcon size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.fabMenuText}>New PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={handleCreateFolder}
          >
            <View style={[styles.fabMenuIcon, { backgroundColor: '#40C057' }]}>
              <FolderIcon size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.fabMenuText}>New Folder</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={handleImportFile}
          >
            <View style={[styles.fabMenuIcon, { backgroundColor: '#FD7E14' }]}>
              <ImageIcon size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.fabMenuText}>Import File</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cover Picker Modal */}
      <Modal
        visible={showCoverPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCoverPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Cover</Text>
              <TouchableOpacity
                onPress={() => setShowCoverPicker(false)}
              >
                <CloseIcon size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
                          <FlatList
              data={coverOptions}
              keyExtractor={(item) => item.id}
              numColumns={2}
              renderItem={({ item }) => {
                const note = selectedNoteId ? 
                  (notes.find(n => n.id.toString() === selectedNoteId) || null) : 
                  null;
                return (
                  <TouchableOpacity
                    style={styles.coverOption}
                    onPress={() => handleCoverSelect(note, item.id)}
                  >
                    <View style={styles.coverPreview}>
                      {item.image ? (
                        <Image
                          source={item.image}
                          style={styles.coverImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[
                          styles.noCoverPlaceholder, 
                          item.id !== 'none' ? { backgroundColor: item.color } : undefined
                        ]}>
                          <Text style={[
                            styles.noCoverText, 
                            item.id !== 'none' ? { color: '#FFFFFF' } : undefined
                          ]}>
                            {item.id === 'none' ? 'No Cover' : item.title[0]}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.coverTitle}>{item.title}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Background overlay when FAB menu is open */}
      {showFABMenu && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleFABMenu}
        />
      )}
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
});

export default NotesScreen;