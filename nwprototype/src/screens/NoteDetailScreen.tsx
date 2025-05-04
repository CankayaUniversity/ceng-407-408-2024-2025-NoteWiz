// src/screens/NoteDetailScreen.tsx - Enhanced Version
import React, { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import RNFS from 'react-native-fs';

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useNotes } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';
import { StarIcon, PdfIcon, ImageIcon, CloseIcon } from '../components/icons';
import Pdf from 'react-native-pdf';
import DocumentPicker from 'react-native-document-picker';
import storage from '@react-native-firebase/storage';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import NoteCoverPicker from '../components/notes/NotesCoverPicker';
const CATEGORIES = [
  'Work',
  'Personal',
  'Shopping',
  'Ideas',
  'To-Do',
  'Other',
];

// Predefined cover options
const COVER_OPTIONS = [
  { id: 'none', title: 'No Cover', image: null },
  { id: 'ai_content', title: 'AI (Content)', image: require('../assets/images/ai-cover2.png') },
  { id: 'blue_sky', title: 'Blue Sky', image: require('../assets/images/blue-sky.png') },
  { id: 'gradient_blue', title: 'Blue Gradient', image: require('../assets/images/gradient-blue.png') },
];

type NoteDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NoteDetail'>;
type NoteDetailScreenRouteProp = RouteProp<RootStackParamList, 'NoteDetail'>;

const NoteDetailScreen = () => {
  const navigation = useNavigation<NoteDetailScreenNavigationProp>();
  const route = useRoute<NoteDetailScreenRouteProp>();
  const { addNote, updateNote, deleteNote } = useNotes();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const noteId = route.params?.noteId;
  const folderId = route.params?.folderId;
  
  // Note state
  const [title, setTitle] = useState(route.params?.title || '');
  const [content, setContent] = useState(route.params?.content || '');
  const [category, setCategory] = useState(route.params?.category || 'Other');
  const [isImportant, setIsImportant] = useState(route.params?.isImportant || false);
  
  // Cover image
  const [coverImage, setCoverImage] = useState(route.params?.coverImage);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  
  // PDF related state
  const [isPdf, setIsPdf] = useState(route.params?.isPdf || false);
  const [pdfUrl, setPdfUrl] = useState(route.params?.pdfUrl || '');
  const [pdfName, setPdfName] = useState(route.params?.pdfName || '');

  // UI states
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // PDF Viewer Component
  const PdfViewer = ({ uri }: { uri: string }) => {
    const source = { uri, cache: true };
    return (
      <View style={styles.pdfContainer}>
        <Text style={styles.pdfNameText}>{pdfName || 'PDF Document'}</Text>
        <Pdf
          source={source}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`PDF loaded: ${numberOfPages} pages`);
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`Current page: ${page}`);
          }}
          onError={(error) => {
            console.error(error);
          }}
          style={styles.pdf}
        />
      </View>
    );
  };

  // PDF File Selection
  const selectPdf = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
      
      const selectedPdf = result[0];
      
      Alert.alert(
        'PDF Selected',
        `"${selectedPdf.name || 'Unnamed PDF'}" file selected.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Use',
            onPress: () => {
              setPdfName(selectedPdf.name || 'Unnamed PDF');
              setIsPdf(true);
              setContent('');
              setPdfUrl(selectedPdf.uri);
            }
          }
        ]
      );
      
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled file selection');
      } else {
        console.error('File selection error:', err);
      }
    }
  };

  const getPathFromURI = async (uri: string): Promise<string> => {
    if (Platform.OS === 'android' && uri.startsWith('content://')) {
      const destPath = `${RNFS.CachesDirectoryPath}/${Date.now()}.pdf`;
      await RNFS.copyFile(uri, destPath);
      return destPath;
    }
    return uri;
  };
  // PDF Upload

  const uploadPdf = async (pdfUri: string, pdfName: string): Promise<string> => {
    const firebaseUser = auth().currentUser;
    if (!firebaseUser?.uid) {
      throw new Error('Firebase user not logged in');
    }
  
    const fileName = `pdfs/${firebaseUser.uid}/${Date.now()}_${pdfName || 'document.pdf'}`;
    const reference = storage().ref(fileName);
  
    const filePath = await getPathFromURI(pdfUri);
    await reference.putFile(filePath);
  
    return await reference.getDownloadURL();
  };
  

  // Handle Cover Image Selection
  const handleCoverSelect = async (coverId: string) => {
    setShowCoverPicker(false);
    
    if (coverId === 'none') {
      // Remove cover
      setCoverImage(null);
      return;
    }
    
    if (coverId === 'ai_title' || coverId === 'ai_content') {
      // In a real app, this would call an AI service to generate a custom cover
      // For now, we'll simulate by randomly selecting one of the predefined covers
      const generateType = coverId === 'ai_title' ? 'title' : 'content';
      Alert.alert(
        'AI Cover Generator',
        `Generating cover based on note ${generateType}...`,
        [{ text: 'OK' }]
      );
      
      // Simulate AI generation by selecting a random cover from predefined options
      const availableCovers = COVER_OPTIONS.filter(c => 
        c.id !== 'none' && 
        c.id !== 'ai_title' && 
        c.id !== 'ai_content'
      );
      const randomCover = availableCovers[Math.floor(Math.random() * availableCovers.length)];
      setCoverImage(randomCover.image);
      return;
    }
    
    // Set one of the predefined covers
    const selectedCover = COVER_OPTIONS.find(c => c.id === coverId);
    if (selectedCover) {
      setCoverImage(selectedCover.image);
    }
  };

  // Set up header with additional options
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          {/* PDF button */}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={selectPdf}
          >
            <Text style={styles.headerButtonText}>📄 PDF</Text>
          </TouchableOpacity>
          
          {/* Draw button */}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Drawing', { noteId })}
          >
            <Text style={styles.headerButtonText}>✏️ Draw</Text>
          </TouchableOpacity>
          
          {/* More options button */}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowMoreOptions(!showMoreOptions)}
          >
            <Text style={styles.headerButtonText}>•••</Text>
          </TouchableOpacity>
          
          {/* Save button */}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleSave}
          >
            <Text style={styles.headerButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, noteId, title, content, category, isImportant, isPdf, pdfUrl, pdfName, coverImage, showMoreOptions]);

  const handleSave = async () => {
    if (!isPdf && !title.trim()) {
      Alert.alert('Warning', 'Please enter a title');
      return;
    }
  
    setIsLoading(true);
    try {
      let finalPdfUrl = pdfUrl;
  
      // If a new PDF was selected and not yet uploaded
      if (isPdf && pdfUrl && !pdfUrl.startsWith('https://')) {
        // Upload PDF to Firebase Storage
        finalPdfUrl = await uploadPdf(pdfUrl,pdfName);
      }
  
      const noteData: any = {
        title: title?.trim() || (isPdf ? pdfName : 'Note'),
        content: isPdf ? '' : content?.trim() || '',
        category: category || 'Other',
        isImportant,
        isPdf,
        coverImage,
        folderId,
      };
  
      if (isPdf) {
        noteData.pdfUrl = finalPdfUrl;
        noteData.pdfName = pdfName;
      }
  
      if (noteId) {
        await updateNote(noteId, noteData);
      } else {
        await addNote(noteData);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              if (!noteId) {
                throw new Error('Note ID not found');
              }
              
              // Delete the note (including any PDF or cover image)
              await deleteNote(noteId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView}>
        {/* Cover image */}
        {coverImage && (
          <View style={styles.coverImageContainer}>
            <Image 
              source={coverImage} 
              style={styles.coverImage}
              resizeMode="cover"
            />
            <TouchableOpacity 
              style={styles.changeCoverButton}
              onPress={() => setShowCoverPicker(true)}
            >
              <Text style={styles.changeCoverText}>Change Cover</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Star button for marking important */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.starButton}
            onPress={() => setIsImportant(!isImportant)}
          >
            <StarIcon
              size={24}
              color={isImportant ? '#FFD700' : '#CCCCCC'}
            />
          </TouchableOpacity>
          
          {/* Add cover button (only visible if no cover exists) */}
          {!coverImage && (
            <TouchableOpacity
              style={styles.addCoverButton}
              onPress={() => setShowCoverPicker(true)}
            >
              <ImageIcon size={20} color={COLORS.primary.main} />
              <Text style={styles.addCoverText}>Add Cover</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Title input */}
        <TextInput
          style={styles.titleInput}
          placeholder={isPdf ? "PDF Title" : "Title"}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        {/* Category selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* PDF or note content */}
        {isPdf && pdfUrl ? (
          <PdfViewer uri={pdfUrl} />
        ) : (
          <TextInput
            style={styles.contentInput}
            placeholder="Note content..."
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        )}
        
        {/* PDF mode switch button */}
        {isPdf && (
          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => {
              setIsPdf(false);
              setPdfUrl('');
              setPdfName('');
            }}
          >
            <Text style={styles.switchModeButtonText}>Switch to Text Note</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* More options menu */}
      {showMoreOptions && (
        <SafeAreaView style={styles.optionsMenuContainer}>
          <View style={styles.optionsMenu}>
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => {
                setShowMoreOptions(false);
                setShowCoverPicker(true);
              }}
            >
              <ImageIcon size={20} color={COLORS.primary.main} />
              <Text style={styles.optionText}>
                {coverImage ? 'Change Cover' : 'Add Cover'}
              </Text>
            </TouchableOpacity>
            
            {noteId && (
              <TouchableOpacity 
                style={styles.optionItem}
                onPress={() => {
                  setShowMoreOptions(false);
                  handleDelete();
                }}
              >
                <Text style={styles.optionTextDelete}>Delete Note</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => setShowMoreOptions(false)}
            >
              <Text style={styles.optionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          {/* Backdrop */}
          <TouchableOpacity
            style={styles.optionsBackdrop}
            activeOpacity={1}
            onPress={() => setShowMoreOptions(false)}
          />
        </SafeAreaView>
      )}

      {/* Cover picker modal */}
      <NoteCoverPicker
        visible={showCoverPicker}
        onClose={() => setShowCoverPicker(false)}
        onSelectCover={handleCoverSelect}
        coverOptions={COVER_OPTIONS}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.paper,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  changeCoverButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  changeCoverText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  headerButtonText: {
    color: COLORS.primary.main,
    fontSize: 16,
    fontWeight: '600',
  },
  starButton: {
    padding: 8,
  },
  addCoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addCoverText: {
    color: COLORS.primary.main,
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingBottom: 8,
    color: COLORS.text.primary,
  },
  categoryContainer: {
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background.surface,
    marginHorizontal: 4,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary.main,
  },
  categoryText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  categoryTextActive: {
    color: COLORS.text.inverted,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
    minHeight: 300,
    color: COLORS.text.primary,
    textAlignVertical: 'top',
  },
  // PDF Styles
  pdfContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 500,
  },
  pdfNameText: {
    padding: 8,
    backgroundColor: COLORS.background.surface,
    fontSize: 14,
    color: COLORS.text.secondary,
    borderBottomWidth: 1,
    borderBottomColor:  COLORS.neutral[300],
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width - 32,
    height: 500,
    backgroundColor: COLORS.background.surface,
  },
  switchModeButton: {
    backgroundColor: COLORS.background.surface,
    padding: 12,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  switchModeButtonText: {
    color: COLORS.primary.main,
    fontSize: 16,
    fontWeight: '600',
  },
  // Options Menu
  optionsMenuContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  optionsBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  optionsMenu: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 80,
    right: 16,
    backgroundColor: COLORS.background.paper,
    borderRadius: 8,
    paddingVertical: 8,
    zIndex: 2,
    ...SHADOWS.lg,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text.primary,
    marginLeft: 8,
  },
  optionTextDelete: {
    fontSize: 16,
    color: COLORS.error.main,
  },
});

export default NoteDetailScreen;