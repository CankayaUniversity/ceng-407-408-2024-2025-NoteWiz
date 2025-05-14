// src/screens/NoteDetailScreen.tsx - .NET API hatası düzeltildi
import React, { useState, useEffect } from 'react';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  ImageSourcePropType,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useNotes } from '../contexts/NoteContext';
import { useAuth } from '../contexts/AuthContext';
import { StarIcon, PdfIcon, ImageIcon, CloseIcon } from '../components/icons';
import Pdf from 'react-native-pdf';
import DocumentPicker from 'react-native-document-picker';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import NoteCoverPicker from '../components/notes/NotesCoverPicker';
import { apiClient } from '../services/newApi';
import { UpdateNoteDto } from '../types/note';
import { askAI, getSummary, rewriteText } from '../services/openai';
import PDFView from 'react-native-pdf';

const CATEGORIES = [
  'Work',
  'Personal',
  'Shopping',
  'Ideas',
  'To-Do',
  'Other',
];

interface CoverOption {
  id: string;
  type: string;
  image: ImageSourcePropType | null;
  imageUrl: string | null;
  color: string | null;
}

// Predefined cover options
const COVER_OPTIONS: { [key: string]: CoverOption[] } = {
  basic: [
    { id: 'none', type: 'basic', image: null, imageUrl: null, color: '#FFFFFF' },
    { id: 'basic-black', type: 'basic', image: null, imageUrl: null, color: '#000000' },
  ],
  illust: [
    { id: 'gradient-blue', type: 'illust', image: require('../assets/images/gradient-blue.png'), imageUrl: 'https://yourcdn.com/gradient-blue.png', color: null },
    { id: 'ai-cover', type: 'illust', image: require('../assets/images/ai-cover.png'), imageUrl: 'https://yourcdn.com/ai-cover.png', color: null },
    { id: 'ai-cover2', type: 'illust', image: require('../assets/images/ai-cover2.png'), imageUrl: 'https://yourcdn.com/ai-cover2.png', color: null },
    { id: 'blue-sky', type: 'illust', image: require('../assets/images/blue-sky.png'), imageUrl: 'https://yourcdn.com/blue-sky.png', color: null },
  ],
  pastel: [
    { id: 'pastel-pink', type: 'pastel', image: null, imageUrl: null, color: '#FFE4E1' },
    { id: 'pastel-blue', type: 'pastel', image: null, imageUrl: null, color: '#E0FFFF' },
    { id: 'pastel-green', type: 'pastel', image: null, imageUrl: null, color: '#E0FFF0' },
  ]
};

type NoteDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NoteDetail'>;
type NoteDetailScreenRouteProp = RouteProp<RootStackParamList, 'NoteDetail'>;

const NoteDetailScreen = () => {
  const navigation = useNavigation<NoteDetailScreenNavigationProp>();
  const route = useRoute<NoteDetailScreenRouteProp>();
  const { createNote, updateNote, deleteNote, notes } = useNotes();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const noteIdParam = route.params?.noteId;
  let noteId: number | undefined = undefined;
  if (typeof noteIdParam === 'string') {
    const parsed = parseInt(noteIdParam, 10);
    noteId = isNaN(parsed) ? undefined : parsed;
  } else if (typeof noteIdParam === 'number') {
    noteId = noteIdParam;
  }
  
  // Aynı şekilde folderId için de tip dönüşümü
  const folderIdParam = route.params?.folderId;
  const folderId = folderIdParam ? (typeof folderIdParam === 'string' ? parseInt(folderIdParam) : folderIdParam) : undefined;
  
  // Note state
  const [title, setTitle] = useState(route.params?.title || '');
  const [content, setContent] = useState(route.params?.content || '');
  const [category, setCategory] = useState(route.params?.category || 'Other');
  const [isImportant, setIsImportant] = useState(route.params?.isImportant || false);
  // Cover image
  const [coverImage, setCoverImage] = useState<ImageSourcePropType | string | null>(null);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  
  // PDF related state
  const [isPdf, setIsPdf] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfName, setPdfName] = useState<string>('');

  // UI states
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // AI related state
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [selectedText, setSelectedText] = useState('');

  // New state for selected cover ID
  const [selectedCoverId, setSelectedCoverId] = useState<string>('none');

  const canEdit = route.params?.canEdit !== false; // Varsayılan true, parametre false ise düzenleme kapalı

  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId) return;
      // Önce localde var mı bak
      let note = notes.find(n => n.id?.toString() === noteId.toString());
      if (!note) {
        // API'den çek
        try {
          const res = await apiClient.get(`/notes/${noteId}`);
          note = res.data;
        } catch (err) {
          console.error("Not API'den çekilemedi:", err);
          return;
        }
      }
      if (note) {
        setTitle(note.title || '');
        setContent(note.content || '');
        setCategory(note.category || 'Other');
        setIsImportant(note.isImportant || false);
        setIsPdf(note.isPdf || false);
        setPdfUrl(note.pdfUrl || '');
        setPdfName(note.pdfName || '');
        setCoverImage(note.coverImage || null);
        // ... diğer state'ler
      }
    };
    fetchNote();
  }, [noteId, notes]);

  // PDF'yi cache'e kopyalayan fonksiyon
  async function copyPdfToCache(uri: string, name: string): Promise<string> {
    const destPath = `${RNFS.CachesDirectoryPath}/${Date.now()}_${name}`;
    await RNFS.copyFile(uri, destPath);
    return destPath;
  }

  // PDF File Selection
  const selectPdf = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
      const selectedPdf = result[0];
      const uri = selectedPdf.fileCopyUri || selectedPdf.uri;
      const cachedPath = await copyPdfToCache(uri, selectedPdf.name || 'document.pdf');
      Alert.alert(
        'PDF Selected',
        `"${selectedPdf.name || 'Unnamed PDF'}" file selected. Lütfen kaydetmek için Kaydet butonuna basın.`,
        [
          {
            text: 'Tamam',
            onPress: () => {
              setPdfName(selectedPdf.name || 'Unnamed PDF');
              setIsPdf(true);
              setContent('');
              setPdfUrl(cachedPath); // Artık cache yolunu kullanıyoruz!
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

  // PDF Upload - Updated for .NET API
  const uploadPdf = async (pdfUri: string, pdfName: string): Promise<string> => {
    console.log('uploadPdf fonksiyonu çağrıldı');
    try {
      // pdfUri artık cache dizininde bir yol
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? `file://${pdfUri}` : pdfUri,
        type: 'application/pdf',
        name: pdfName
      });
      console.log('Uploading PDF:', { uri: pdfUri, name: pdfName });
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://10.0.2.2:5263/api/document/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('Upload response status:', response.status);
      const data = await response.text();
      console.log('Upload response data:', data);
      if (!response.ok) {
        throw new Error('Failed to upload PDF: ' + data);
      }
      try {
        const json = JSON.parse(data);
        console.log('uploadPdf: dönen json:', json);
        return json.fileUrl || '';
      } catch (e) {
        console.error('uploadPdf: JSON parse hatası', e);
        return '';
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    } finally {
      console.log('uploadPdf fonksiyonu bitti');
    }
  };

  // Kapak seçimi fonksiyonu
  const handleCoverSelect = (coverId: string, coverColor?: string) => {
    setShowCoverPicker(false);
    setSelectedCoverId(coverId);
    const allCovers = Object.values(COVER_OPTIONS).flat();
    const selected = allCovers.find(c => c.id === coverId);
    if (!selected) return;
    if (selected.image) {
      setCoverImage(selected.image);
    } else if (selected.color) {
      setCoverImage(selected.color);
    } else {
      setCoverImage(null);
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
            onPress={() => {
              if (noteId) {
                navigation.navigate('Drawing', { noteId: noteId.toString() });
              } else {
                Alert.alert('Error', 'Note ID is required');
              }
            }}
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
          
          {/* Share button */}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              if (noteId) {
                navigation.navigate('ShareNote', { noteId: noteId });
              } else {
                Alert.alert('Uyarı', 'Not kaydedilmeden paylaşamazsınız!');
              }
            }}
            disabled={!noteId}
          >
            <Text style={[styles.headerButtonText, !noteId && { opacity: 0.5 }]}>Paylaş</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, noteId, title, content, category, isImportant, isPdf, pdfUrl, pdfName, coverImage, showMoreOptions]);

  // Modified handleSave function for NoteDetailScreen.tsx
  const handleSave = async () => {
    console.log('handleSave fonksiyonu çağrıldı');
    console.log('handleSave state:', { isPdf, pdfUrl, pdfName });
    if (!isPdf && !title.trim()) {
      Alert.alert('Warning', 'Please enter a title');
      return;
    }
    setIsLoading(true);
    try {
      const noteData = {
        title,
        content,
        isImportant,
        color: '#7950F2',
        coverImage: typeof coverImage === 'string' ? coverImage : undefined,
        isPdf,
        pdfUrl,
        pdfName,
        category,
        folderId: folderId !== undefined && folderId !== null ? folderId.toString() : null,
        tags: [],
      };
      console.log('Saving note data:', noteData);
      if (!noteId) {
        // Yeni not oluşturuluyor
        const createdNote = await createNote(noteData);
        if (createdNote && createdNote.id) {
          navigation.replace('NoteDetail', { noteId: createdNote.id });
        } else {
          Alert.alert('Hata', 'Not oluşturulamadı!');
        }
      } else {
        // Var olan not güncelleniyor
        if (noteId === undefined || noteId === null) {
          Alert.alert('Hata', 'Not ID bulunamadı!');
          return;
        }
        await updateNote(noteId, noteData);
      }
    } catch (err) {
      Alert.alert('Error', 'Note could not be saved!');
      console.error('Error saving note:', err);
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
              
              // Doğrudan note servisi kullanarak notu sil
              await deleteNote(noteId.toString());
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

  // PDF Viewer Component
  const PdfViewer = ({ uri }: { uri: string }) => {
    // Eğer uri http ile başlıyorsa file:// ekleme!
    const isHttp = uri.startsWith('http://') || uri.startsWith('https://');
    const source = { uri: isHttp ? uri : (Platform.OS === 'android' ? `file://${uri}` : uri), cache: true };
    return (
      <View style={styles.pdfContainer}>
        <Text style={styles.pdfNameText}>{pdfName || 'PDF Document'}</Text>
        <PDFView
          source={source}
          style={{ width: '100%', height: 500 }}
        />
      </View>
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
      {/* Permission Bar */}
      <View style={{ height: 6, width: '100%', backgroundColor: canEdit ? '#FF69B4' : '#4CAF50' }} />
      {/* Legend Box */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 6, marginBottom: 2 }}>
        <View style={{ width: 18, height: 8, backgroundColor: '#FF69B4', borderRadius: 2, marginRight: 4 }} />
        <Text style={{ fontSize: 12, color: '#888', marginRight: 12 }}>Düzenleme Yetkisi</Text>
        <View style={{ width: 18, height: 8, backgroundColor: '#4CAF50', borderRadius: 2, marginRight: 4 }} />
        <Text style={{ fontSize: 12, color: '#888' }}>Sadece Görüntüleme</Text>
      </View>
      <ScrollView style={{ flex: 1 }}>
        {/* Cover image */}
        {coverImage && (
          typeof coverImage === 'string' && coverImage.startsWith('#') ? (
            <View style={[styles.coverImage, { backgroundColor: coverImage }]} />
          ) : (
            <Image
              source={typeof coverImage === 'string' ? { uri: coverImage } : coverImage}
              style={styles.coverImage}
              resizeMode="cover"
            />
          )
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
          editable={canEdit}
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
            onSelectionChange={e => {
              const { start, end } = e.nativeEvent.selection;
              if (start !== end) {
                setSelectedText(content.substring(start, end));
              } else {
                setSelectedText('');
              }
            }}
            editable={canEdit}
          />
        )}
        
        {/* AI'ye Soru Sor Butonu */}
        <TouchableOpacity
          style={{ backgroundColor: '#4C6EF5', padding: 12, borderRadius: 8, margin: 16, alignItems: 'center' }}
          onPress={() => {
            setAiPrompt(selectedText || '');
            setAiModalVisible(true);
          }}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>AI'ye Soru Sor</Text>
        </TouchableOpacity>
        
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
        selectedCoverId={selectedCoverId}
      />

      {/* AI Modal */}
      <Modal visible={aiModalVisible} transparent animationType="slide">
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)'
        }}>
          <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 20, width: '80%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>AI'ye Soru Sor</Text>
            <TextInput
              value={aiPrompt}
              onChangeText={setAiPrompt}
              placeholder="AI'ye sorulacak metni girin"
              style={{ borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, padding: 8, minHeight: 60, marginBottom: 12 }}
              multiline
            />
            <TouchableOpacity
              style={{ backgroundColor: '#12B886', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 8 }}
              onPress={async () => {
                const result = await askAI(aiPrompt);
                setAiResponse(result);
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>AI'ye Sor</Text>
            </TouchableOpacity>
            {aiResponse ? (
              <>
                <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Cevap:</Text>
                <Text style={{ marginVertical: 8 }}>{aiResponse}</Text>
                <TouchableOpacity
                  style={{ backgroundColor: '#4C6EF5', borderRadius: 8, padding: 10, alignItems: 'center', marginBottom: 8 }}
                  onPress={() => {
                    setContent(content + '\n' + aiResponse);
                    setAiModalVisible(false);
                    setAiResponse('');
                  }}
                >
                  <Text style={{ color: '#FFF' }}>Notuma Ekle</Text>
                </TouchableOpacity>
              </>
            ) : null}
            <TouchableOpacity
              style={{ backgroundColor: '#868E96', borderRadius: 8, padding: 10, alignItems: 'center' }}
              onPress={() => setAiModalVisible(false)}
            >
              <Text style={{ color: '#FFF' }}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Save Button (bottom floating) */}
      <TouchableOpacity
        style={{
          backgroundColor: canEdit ? '#4C6EF5' : '#B0B0B0',
          padding: 16,
          borderRadius: 8,
          margin: 16,
          alignItems: 'center',
          position: 'absolute',
          bottom: 0,
          left: 16,
          right: 16,
          zIndex: 100,
          opacity: canEdit ? 1 : 0.5,
        }}
        onPress={handleSave}
        disabled={!canEdit}
      >
        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>Kaydet</Text>
      </TouchableOpacity>
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
    height: 180,
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
    color: COLORS.text.primary,
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
    borderColor: COLORS.border.light,
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
    borderBottomColor: COLORS.border.light,
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