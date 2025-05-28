// src/screens/NoteDetailScreen.tsx - .NET API hatası düzeltildi
import React, { useState, useEffect, useRef } from 'react';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';

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
import ViewShot from 'react-native-view-shot';
import { Image as RNImage } from 'react-native';
import { API_URL } from '../config/api';
import { useCategories } from '../contexts/CategoriesContext';
import Svg, { Path } from 'react-native-svg';
import { PanResponder, GestureResponderEvent } from 'react-native';

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
  const navigation = useNavigation<any>();
  const route = useRoute<NoteDetailScreenRouteProp>();
  const { createNote, updateNote, deleteNote, notes, loadNotes } = useNotes();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { categories, addCategory } = useCategories();

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
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [isImportant, setIsImportant] = useState(route.params?.isImportant || false);
  // Cover image
  const [coverImage, setCoverImage] = useState<ImageSourcePropType | string | null>(null);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  
  // PDF related state
  const [isPdf, setIsPdf] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfName, setPdfName] = useState<string>('');
  const [isLocalOnly, setIsLocalOnly] = useState(false);

  // UI states
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // AI related state
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  // New state for selected cover ID
  const [selectedCoverId, setSelectedCoverId] = useState<string>('none');

  const [popupImageUri, setPopupImageUri] = useState<string | null>(null);
  const popupViewRef = React.useRef<any>(null);

  const canEdit = route.params?.canEdit !== false; // Varsayılan true, parametre false ise düzenleme kapalı

  const [showAddModal, setShowAddModal] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [newLink, setNewLink] = useState('');

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  // Default kategoriler
  const DEFAULT_CATEGORIES: { name: string; color: string }[] = [
    { name: 'Work', color: '#4C6EF5' },
    { name: 'Personal', color: '#FF8787' },
    { name: 'Shopping', color: '#63E6BE' },
    { name: 'Ideas', color: '#FFD43B' },
    { name: 'To-Do', color: '#845EF7' },
    { name: 'Other', color: '#868E96' },
  ];

  // PDF Viewer için state
  const [pdfViewerUri, setPdfViewerUri] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [numberOfPages, setNumberOfPages] = useState(1);

  const screenHeight = Dimensions.get('window').height;

  // Çizim için state'ler
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [strokes, setStrokes] = useState<{path: string; color: string; strokeWidth: number}[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState<number>(3);
  const currentPoints = useRef<{x: number; y: number}[]>([]);

  // PanResponder için
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        console.log('PanResponder Grant');
        console.log('X:', evt.nativeEvent.locationX, 'Y:', evt.nativeEvent.locationY);
        if (!isDrawingMode) return;
        currentPoints.current = [];
        const p = {
          x: evt.nativeEvent.locationX,
          y: evt.nativeEvent.locationY,
        };
        currentPoints.current.push(p);
        setCurrentPath(generatePath(currentPoints.current));
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        console.log('PanResponder Move');
        console.log('X:', evt.nativeEvent.locationX, 'Y:', evt.nativeEvent.locationY);
        if (!isDrawingMode) return;
        const p = {
          x: evt.nativeEvent.locationX,
          y: evt.nativeEvent.locationY,
        };
        currentPoints.current.push(p);
        setCurrentPath(generatePath(currentPoints.current));
        console.log('currentPath:', generatePath(currentPoints.current));
        console.log('strokes:', strokes);
      },
      onPanResponderRelease: () => {
        console.log('PanResponder Release');
        if (!isDrawingMode) return;
        if (currentPoints.current.length > 0) {
          const finalPath = generatePath(currentPoints.current);
          const newStroke = {
            path: finalPath,
            color: selectedColor,
            strokeWidth: selectedStrokeWidth,
          };
          setStrokes((prev) => [...prev, newStroke]);
        }
        currentPoints.current = [];
        setCurrentPath('');
        console.log('currentPath:', currentPath);
        console.log('strokes:', strokes);
      },
    })
  ).current;

  const generatePath = (points: {x: number; y: number}[]) => {
    if (!points.length) return '';
    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L${points[i].x},${points[i].y}`;
    }
    return d;
  };

  const handleUndo = () => {
    if (strokes.length > 0) {
      setStrokes((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentPath('');
  };

  // PDF url değiştiğinde, gerekirse content://'i file://'a kopyala
  useEffect(() => {
    let isMounted = true;
    const preparePdfUri = async () => {
      if (isPdf && pdfUrl) {
        setPdfLoading(true);
        let viewerUri = pdfUrl;
        if (pdfUrl.startsWith('content://')) {
          const destPath = `${RNFS.TemporaryDirectoryPath || RNFS.CachesDirectoryPath}/${Date.now()}_pdf.pdf`;
          try {
            await RNFS.copyFile(pdfUrl, destPath);
            viewerUri = destPath.startsWith('file://') ? destPath : `file://${destPath}`;
          } catch (e) {
            console.log('PDF kopyalama hatası:', e);
          }
        }
        if (isMounted) setPdfViewerUri(viewerUri);
        setPdfLoading(false);
      } else {
        setPdfViewerUri(null);
      }
    };
    preparePdfUri();
    return () => { isMounted = false; };
  }, [isPdf, pdfUrl]);

  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId) return;
      try {
        let note;
        // Önce notes array'inden notu bulmaya çalış (cache'den)
        note = notes.find(n => n.id.toString() === noteId.toString());
        
        // Eğer notes array'inde bulunamazsa ve online ise API'den çek
        if (!note) {
          const res = await apiClient.get(`/notes/${noteId}`);
          note = res.data;
        }

        if (note) {
          setTitle(note.title || '');
          setContent(note.content || '');
          setCategoryId(note.categoryId || null);
          setIsImportant(note.isImportant || false);
          setIsPdf(note.isPdf || false);
          setPdfUrl(note.pdfUrl || '');
          setPdfName(note.pdfName || '');
          setCoverImage(note.coverImage || null);
        }
      } catch (err) {
        console.error("Not yüklenemedi:", err);
      }
    };
    fetchNote();
  }, [noteId, notes]);

  // Kategori seçimini ilk açılışta notun kategorisine göre ayarla
  useEffect(() => {
    // Eğer route.params?.category varsa, categories listesinden id'yi bul
    if (route.params?.category) {
      const found = categories.find(c => c.name === route.params.category);
      if (found) setCategoryId(found.id);
    }
  }, [route.params?.category, categories]);

  // Notu açarken categoryId'yi set et
  useEffect(() => {
    if (noteId) {
      const note = notes.find(n => n.id.toString() === noteId.toString());
      if (note && note.category) {
        const found = categories.find(c => c.name === note.category);
        if (found) setCategoryId(found.id);
      }
    }
  }, [noteId, notes, categories]);

  // PDF'yi cache'e kopyalayan fonksiyon
  async function copyPdfToCache(uri: string, name: string): Promise<string> {
    // If it's already a local file, return the URI directly
    if (uri.startsWith('file://') || uri.startsWith('content://')) {
      return uri;
    }
    
    // Otherwise, download and cache it
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
      // (İstersen burada PDF'den metin de çıkarabilirsin)
      // let pdfText = await PdfText.extract(uri);
      setPdfName(selectedPdf.name || 'Unnamed PDF');
      setIsPdf(true);
      setContent('PDF eklendi'); // veya pdfText
      setTitle(selectedPdf.name || 'PDF');
      setPdfUrl(uri);
      setIsLocalOnly(true);
      // Eğer documentId gerekiyorsa, burada setDocumentId(null) veya uygun değeri ata
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled file selection');
      } else {
        console.error('File selection error:', err);
      }
    }
  };

  // PDF Upload - Only upload when sharing is needed
  const uploadPdf = async (pdfUri: string, pdfName: string): Promise<string> => {
    // If it's already a remote URL, return it
    if (pdfUri.startsWith('http://') || pdfUri.startsWith('https://')) {
      return pdfUri;
    }

    console.log('uploadPdf fonksiyonu çağrıldı');
    try {
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
          {/* Ekle butonu */}
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowAddModal(true)}>
            <Text style={styles.headerButtonText}>Ekle</Text>
          </TouchableOpacity>
          {/* PDF button */}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={selectPdf}
          >
            <Text style={styles.headerButtonText}>📄 PDF</Text>
          </TouchableOpacity>
          {/* Draw button eski haliyle */}
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
  }, [navigation, noteId, title, content, categoryId, isImportant, isPdf, pdfUrl, pdfName, coverImage]);

  // Modified handleSave function for NoteDetailScreen.tsx
  const handleSave = async () => {
    console.log('Kaydet butonuna basıldı, categoryId:', categoryId);
    console.log('Kaydedilecek veri:', {
      title,
      content,
      pdfUrl,
      pdfName,
      isPdf,
      isLocalOnly,
      categoryId
    });
    if (!isPdf && !title.trim()) {
      Alert.alert('Warning', 'Please enter a title');
      return;
    }
    if (!categoryId) {
      Alert.alert('Uyarı', 'Lütfen bir kategori seçin!');
      return;
    }
    setIsLoading(true);
    try {
      // Sadece backend'in beklediği alanları gönder
      const noteData: any = {
        title: title,
        content: content,
        color: '#7950F2',
        tags: "",
        categoryId: categoryId,
        isPdf: isPdf,
        pdfUrl: pdfUrl,
        pdfName: pdfName,
        isLocalOnly: isLocalOnly,
        // documentId: documentId, // Eğer ileride gerekirse ekle
      };
      // undefined olanları gönderme
      Object.keys(noteData).forEach(key => {
        if (noteData[key] === undefined) delete noteData[key];
      });
      console.log('Saving note data:', noteData);
      if (!noteId) {
        // Yeni not oluşturuluyor
        const createdNote = await createNote(noteData);
        if (createdNote && createdNote.id) {
          setContent(createdNote.content || content);
          await loadNotes();
          navigation.navigate('MainApp', { screen: 'Notes' });
        } else {
          Alert.alert('Hata', 'Not oluşturulamadı!');
        }
      } else {
        // Var olan not güncelleniyor
        if (noteId === undefined || noteId === null) {
          Alert.alert('Hata', 'Not ID bulunamadı!');
          return;
        }
        const updated = await updateNote(noteId, noteData);
        if (updated && updated.content) {
          setContent(updated.content);
          await loadNotes();
          navigation.navigate('MainApp', { screen: 'Notes' });
        }
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

  // Not içeriğini özel kutularla render eden fonksiyon
  const renderNoteContent = (content: string) => {
    const popupRegex = /\[POPUP\]([\s\S]*?)\[\/POPUP\]/g;
    const imageRegex = /\[IMAGE:([^\]]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let key = 0;
    // Önce popup'ları işle
    while ((match = popupRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        // Popup öncesi metni işle (içinde image varsa onları da işle)
        const textBefore = content.substring(lastIndex, match.index);
        let imgLast = 0;
        let imgMatch;
        while ((imgMatch = imageRegex.exec(textBefore)) !== null) {
          if (imgMatch.index > imgLast) {
            parts.push(
              <Text key={key++} style={{ fontSize: 16, color: COLORS.text.primary }}>
                {textBefore.substring(imgLast, imgMatch.index)}
              </Text>
            );
          }
          parts.push(
            <Image
              key={key++}
              source={{ uri: imgMatch[1] }}
              style={{ width: '100%', height: 180, borderRadius: 12, marginVertical: 8 }}
              resizeMode="cover"
            />
          );
          imgLast = imgMatch.index + imgMatch[0].length;
        }
        if (imgLast < textBefore.length) {
          parts.push(
            <Text key={key++} style={{ fontSize: 16, color: COLORS.text.primary }}>
              {textBefore.substring(imgLast)}
            </Text>
          );
        }
      }
      parts.push(
        <View key={key++} style={{ backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: '#4C6EF5', padding: 12, marginVertical: 8 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>Pop-up</Text>
          <Text style={{ fontSize: 15 }}>{match[1]}</Text>
        </View>
      );
      lastIndex = match.index + match[0].length;
    }
    // Son popup'tan sonra kalan metni işle (image'ları da dahil et)
    if (lastIndex < content.length) {
      const textAfter = content.substring(lastIndex);
      let imgLast = 0;
      let imgMatch;
      while ((imgMatch = imageRegex.exec(textAfter)) !== null) {
        if (imgMatch.index > imgLast) {
          parts.push(
            <Text key={key++} style={{ fontSize: 16, color: COLORS.text.primary }}>
              {textAfter.substring(imgLast, imgMatch.index)}
            </Text>
          );
        }
        parts.push(
          <Image
            key={key++}
            source={{ uri: imgMatch[1] }}
            style={{ width: '100%', height: 180, borderRadius: 12, marginVertical: 8 }}
            resizeMode="cover"
          />
        );
        imgLast = imgMatch.index + imgMatch[0].length;
      }
      if (imgLast < textAfter.length) {
        parts.push(
          <Text key={key++} style={{ fontSize: 16, color: COLORS.text.primary }}>
            {textAfter.substring(imgLast)}
          </Text>
        );
      }
    }
    return parts;
  };

  // Ekle modalı ve fonksiyonlar
  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
      if (response.didCancel) {
        // Kullanıcı iptal etti
        return;
      } else if (response.errorCode) {
        Alert.alert('Hata', 'Resim seçilemedi: ' + response.errorMessage);
        return;
      } else {
        const assets = response.assets;
        if (assets && Array.isArray(assets) && assets[0]?.uri) {
          setContent(prev => prev + `\n[IMAGE:${assets[0].uri}]\n`);
          setShowAddModal(false);
        }
      }
    });
  };
  const handleAddLink = () => {
    if (newLink.trim()) {
      setContent(prev => prev + `\n[LINK:${newLink.trim()}]\n`);
      setNewLink('');
      setShowLinkInput(false);
      setShowAddModal(false);
    }
  };

  // Seçili metin aralığı ve metni için state
  const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });

  // Kelime seçimi için state
  const [wordSelectStart, setWordSelectStart] = useState<number | null>(null);
  const [wordSelectEnd, setWordSelectEnd] = useState<number | null>(null);
  const [wordSelectedText, setWordSelectedText] = useState('');

  // Kelime kelime böl
  const words = content.split(/(\s+)/); // Boşlukları da koru

  // Kelimeye tıklama fonksiyonu
  const handleWordPress = (idx: number) => {
    if (!canEdit) return;
    
    if (wordSelectStart === null) {
      setWordSelectStart(idx);
      setWordSelectEnd(null);
      setWordSelectedText('');
    } else if (wordSelectEnd === null) {
      setWordSelectEnd(idx);
      // Başlangıç ve bitişi sırala
      const start = Math.min(wordSelectStart, idx);
      const end = Math.max(wordSelectStart, idx);
      const selected = words.slice(start, end + 1).join('');
      setWordSelectedText(selected);
    } else {
      // Yeni seçim başlat
      setWordSelectStart(idx);
      setWordSelectEnd(null);
      setWordSelectedText('');
    }
  };

  // Seçili metni düzenleme fonksiyonu
  const handleEditSelectedText = (newText: string) => {
    if (!canEdit || wordSelectStart === null || wordSelectEnd === null) return;
    
    const start = Math.min(wordSelectStart, wordSelectEnd);
    const end = Math.max(wordSelectStart, wordSelectEnd);
    
    const newWords = [...words];
    newWords.splice(start, end - start + 1, newText);
    setContent(newWords.join(''));
    
    // Seçimi sıfırla
    setWordSelectStart(null);
    setWordSelectEnd(null);
    setWordSelectedText('');
  };

  // Yeni kelime ekleme fonksiyonu
  const handleAddWord = (word: string) => {
    if (!canEdit) return;
    setContent(prev => prev + ' ' + word);
  };

  const [editMode, setEditMode] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* AI'ye Soru Sor butonu */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', padding: 12 }}>
        <TouchableOpacity
          style={{ backgroundColor: '#4C6EF5', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 }}
          onPress={() => {
            setSelectedText(content); // Content'i seçili metin olarak ayarla
            setAiModalVisible(true);
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Not ile ilgili AI'ya Soru Sor</Text>
        </TouchableOpacity>
      </View>
      {/* Edit/Görünüm butonu */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 16 }}>
        {editMode ? (
          <TouchableOpacity
            style={{ backgroundColor: '#868E96', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 16, marginBottom: 8 }}
            onPress={() => setEditMode(false)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Kaydet</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{ backgroundColor: '#4C6EF5', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 16, marginBottom: 8 }}
            onPress={() => setEditMode(true)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Düzenle</Text>
          </TouchableOpacity>
        )}
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 140 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Edit Mode: Sadece edit alanı ve kelime seçme */}
          {editMode ? (
            <View style={{ backgroundColor: '#fff', borderRadius: 8, margin: 8, borderWidth: 2, borderColor: 'red', padding: 12 }}>
              <TextInput
                style={[styles.contentInput, { marginBottom: 8, borderWidth: 0 }]}
                placeholder="İçerik yazın..."
                value={content}
                onChangeText={setContent}
                multiline
                editable={canEdit}
              />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {words.map((word, idx) => {
                  // Seçili aralıkta mı?
                  let isSelected = false;
                  if (wordSelectStart !== null && wordSelectEnd !== null) {
                    const start = Math.min(wordSelectStart, wordSelectEnd);
                    const end = Math.max(wordSelectStart, wordSelectEnd);
                    isSelected = idx >= start && idx <= end;
                  }
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleWordPress(idx)}
                      style={{
                        backgroundColor: isSelected ? '#FFE066' : 'transparent',
                        borderRadius: 4,
                        margin: 1,
                        paddingHorizontal: 2,
                      }}
                    >
                      <Text style={{ fontSize: 16, color: '#222' }}>{word}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : (
            <>
              {/* Sadece güzel görünümlü alanlar */}
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
              {/* Kategori, başlık, renderNoteContent */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryContainer}
              >
                {(categories.length > 0 ? categories : DEFAULT_CATEGORIES).map((cat: any, idx: number) => (
                  <TouchableOpacity
                    key={`${cat.id || cat.name}_${idx}`}
                    style={[
                      styles.categoryButton,
                      categoryId === cat.id && styles.categoryButtonActive,
                    ]}
                    onPress={async () => {
                      console.log('Kategoriye tıklandı:', cat);
                      if (!cat.id) {
                        setAddingCategory(true);
                        try {
                          await addCategory(cat.name, cat.color || '#868E96');
                          setTimeout(() => {
                            const added = categories.find((c) => c.name === cat.name);
                            if (added) {
                              console.log('Yeni eklenen kategori bulundu:', added);
                              setCategoryId(added.id);
                            }
                          }, 500);
                        } finally {
                          setAddingCategory(false);
                        }
                      } else {
                        console.log('Mevcut kategori seçildi, id:', cat.id);
                        setCategoryId(cat.id);
                      }
                    }}
                    disabled={addingCategory}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        categoryId === cat.id && styles.categoryTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                {/* Diğer/Kategori Ekle tuşu */}
                <TouchableOpacity
                  style={[styles.categoryButton, { borderStyle: 'dashed', borderWidth: 1, borderColor: '#868E96' }]}
                  onPress={() => setShowAddCategoryModal(true)}
                >
                  <Text style={styles.categoryText}>+ Kategori Ekle</Text>
                </TouchableOpacity>
              </ScrollView>
              <TextInput
                style={styles.titleInput}
                placeholder={isPdf ? "PDF Title" : "Title"}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
                editable={canEdit}
              />
              <View style={{ paddingHorizontal: 16, paddingTop: 8, minHeight: 300 }}>
                {renderNoteContent(content)}
              </View>
            </>
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

          {/* Seçili metni göster */}
          {wordSelectedText !== '' && (
            <View style={{ backgroundColor: '#F3F0FF', padding: 10, margin: 10, borderRadius: 8 }}>
              <Text style={{ color: '#4C6EF5', fontWeight: 'bold' }}>Seçili metin:</Text>
              <TextInput
                value={wordSelectedText}
                onChangeText={setWordSelectedText}
                style={{ 
                  backgroundColor: '#fff',
                  padding: 8,
                  borderRadius: 6,
                  marginVertical: 8,
                  borderWidth: 1,
                  borderColor: '#E5E5E5'
                }}
                multiline
              />
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <TouchableOpacity 
                  onPress={() => {
                    handleEditSelectedText(wordSelectedText);
                  }}
                  style={{ 
                    backgroundColor: '#4C6EF5',
                    padding: 8,
                    borderRadius: 6,
                    marginRight: 8
                  }}
                >
                  <Text style={{ color: '#fff' }}>Düzenlemeyi Kaydet</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    setSelectedText(wordSelectedText);
                    setAiModalVisible(true);
                  }}
                  style={{ 
                    backgroundColor: '#12B886',
                    padding: 8,
                    borderRadius: 6
                  }}
                >
                  <Text style={{ color: '#fff' }}>AI'ye Gönder</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* İçerik ve resimler (renderNoteContent) */}
          

          {/* PDF Viewer + Drawing Canvas veya normal içerik + çizim */}
          <View style={{ position: 'relative', minHeight: 300, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc' }}>
            {/* PDF veya içerik */}
            {isPdf && pdfViewerUri ? (
              <View style={{ flex: 1, minHeight: screenHeight * 0.7 }}>
                {pdfLoading ? (
                  <ActivityIndicator size="large" color={COLORS.primary.main} style={{ marginTop: 40 }} />
                ) : (
                  <>
                    <View style={{ flex: 1 }}>
                      <Pdf
                        source={{ uri: pdfViewerUri }}
                        style={{ flex: 1, width: '100%', height: '100%' }}
                        onError={error => console.log('PDF render error:', error)}
                        enablePaging={true}
                        horizontal={false}
                        fitPolicy={0}
                        spacing={2}
                        page={page}
                        onPageChanged={(page, numberOfPages) => {
                          setPage(page);
                          setNumberOfPages(numberOfPages);
                        }}
                      />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 8 }}>
                      <TouchableOpacity onPress={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                        <Text style={{ fontSize: 18, marginHorizontal: 16, opacity: page === 1 ? 0.5 : 1 }}>◀</Text>
                      </TouchableOpacity>
                      <Text style={{ fontSize: 16 }}>{page} / {numberOfPages}</Text>
                      <TouchableOpacity onPress={() => setPage(p => Math.min(numberOfPages, p + 1))} disabled={page === numberOfPages}>
                        <Text style={{ fontSize: 18, marginHorizontal: 16, opacity: page === numberOfPages ? 0.5 : 1 }}>▶</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ) : null}

            {/* Şeffaf çizim katmanı */}
            {isDrawingMode && (
              <View
                style={[StyleSheet.absoluteFill, { zIndex: 10, backgroundColor: 'transparent', pointerEvents: 'box-none' }]}
              >
                <View
                  style={{ flex: 1, height: 300 }}
                  {...panResponder.panHandlers}
                  pointerEvents="box-only"
                >
                  <Svg style={{ width: '100%', height: 300, backgroundColor: 'rgba(255,0,0,0.1)' }}>
                    {/* SVG sınırlarını gösteren yeşil path'ler */}
                    <Path d="M0,0 L300,0" stroke="green" strokeWidth={2} />
                    <Path d="M0,0 L0,300" stroke="green" strokeWidth={2} />
                    <Path d="M300,0 L300,300" stroke="green" strokeWidth={2} />
                    <Path d="M0,300 L300,300" stroke="green" strokeWidth={2} />
                    {/* Test için sabit path */}
                    <Path d="M10,10 L290,290" stroke="#000" strokeWidth={5} fill="none" />
                    {/* strokes: mavi */}
                    {strokes.map((stroke, idx) => (
                      <Path
                        key={idx}
                        d={stroke.path}
                        stroke="#0074D9"
                        strokeWidth={stroke.strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                    {/* currentPath: kırmızı */}
                    {currentPath !== '' && (
                      <Path
                        d={currentPath}
                        stroke="#FF4136"
                        strokeWidth={selectedStrokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </Svg>
                </View>
              </View>
            )}
          </View>

          {/* Çizim araçları */}
          {isDrawingMode && (
            <View style={styles.drawingTools}>
              <View style={styles.toolRow}>
                <TouchableOpacity style={styles.toolButton} onPress={handleUndo}>
                  <Text>↩️ Geri Al</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolButton} onPress={handleClear}>
                  <Text>🗑️ Temizle</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.toolButton} 
                  onPress={() => setSelectedStrokeWidth(prev => Math.min(10, prev + 1))}
                >
                  <Text>➕ Kalınlık</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.toolButton} 
                  onPress={() => setSelectedStrokeWidth(prev => Math.max(1, prev - 1))}
                >
                  <Text>➖ Kalınlık</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal style={styles.colorPicker}>
                {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      selectedColor === color && styles.selectedColor,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Cover picker modal */}
      <NoteCoverPicker
        visible={showCoverPicker}
        onClose={() => setShowCoverPicker(false)}
        onSelectCover={handleCoverSelect}
        selectedCoverId={selectedCoverId}
      />

      {/* AI Modal */}
      <Modal visible={aiModalVisible} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 20, width: '80%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>AI'ye Soru Sor</Text>
            <Text style={{ marginBottom: 8, color: '#333' }}>Seçili metin:</Text>
            <Text style={{ backgroundColor: '#F3F0FF', padding: 8, borderRadius: 6, marginBottom: 12 }}>{selectedText}</Text>
            <TextInput
              value={aiPrompt}
              onChangeText={setAiPrompt}
              placeholder="AI'ye sorulacak ek soruyu girin"
              style={{ borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 8, padding: 8, minHeight: 40, marginBottom: 12 }}
              multiline
            />
            <TouchableOpacity
              style={{ backgroundColor: '#12B886', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 8 }}
              onPress={async () => {
                setAiLoading(true);
                setAiResponse('');
                try {
                  const fullPrompt = `"${selectedText}"\nKullanıcıdan gelen soru: ${aiPrompt}`;
                  const result = await askAI(fullPrompt);
                  setAiResponse(result);
                } catch (e) {
                  setAiResponse('AI cevabı alınamadı.');
                } finally {
                  setAiLoading(false);
                }
              }}
              disabled={aiLoading || !aiPrompt.trim()}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{aiLoading ? 'Gönderiliyor...' : 'AI ile Sorgula'}</Text>
            </TouchableOpacity>
            {aiResponse !== '' && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>AI Cevabı:</Text>
                <Text style={{ backgroundColor: '#F8F9FA', padding: 8, borderRadius: 6 }}>{aiResponse}</Text>
                <TouchableOpacity
                  style={{ backgroundColor: '#4C6EF5', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 12 }}
                  onPress={() => {
                    setContent(content + '\n' + aiResponse);
                    setAiModalVisible(false);
                    setAiPrompt('');
                    setAiResponse('');
                  }}
                >
                  <Text style={{ color: '#FFF' }}>Notuma yazı olarak ekle</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ backgroundColor: '#4263EB', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 8 }}
                  onPress={() => {
                    setContent(content + `\n[POPUP]${aiResponse}[/POPUP]`);
                    setAiModalVisible(false);
                    setAiPrompt('');
                    setAiResponse('');
                  }}
                >
                  <Text style={{ color: '#FFF' }}>Notuma pop-up olarak ekle</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={{ backgroundColor: '#868E96', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 12 }}
              onPress={() => {
                setAiModalVisible(false);
                setAiPrompt('');
                setAiResponse('');
              }}
            >
              <Text style={{ color: '#FFF' }}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Ekle modalı */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.2)', justifyContent:'center', alignItems:'center' }}>
          <View style={{ backgroundColor:'#fff', borderRadius:12, padding:24, minWidth:240 }}>
            <Text style={{ fontWeight:'bold', fontSize:18, marginBottom:16 }}>Ne eklemek istiyorsun?</Text>
            <TouchableOpacity onPress={pickImage} style={{ padding:12 }}><Text>Resim Ekle</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowAddModal(false); selectPdf(); }} style={{ padding:12 }}><Text>PDF Ekle</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowLinkInput(true); }} style={{ padding:12 }}><Text>Link Ekle</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAddModal(false)} style={{ padding:12, marginTop:8 }}><Text style={{ color:'#888' }}>İptal</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Link ekleme inputu */}
      <Modal visible={showLinkInput} transparent animationType="fade">
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.2)', justifyContent:'center', alignItems:'center' }}>
          <View style={{ backgroundColor:'#fff', borderRadius:12, padding:24, minWidth:240 }}>
            <Text style={{ fontWeight:'bold', fontSize:16, marginBottom:12 }}>Link Ekle</Text>
            <TextInput value={newLink} onChangeText={setNewLink} placeholder="https://..." style={{ borderWidth:1, borderColor:'#eee', borderRadius:8, padding:8, marginBottom:12 }} />
            <View style={{ flexDirection:'row', justifyContent:'flex-end' }}>
              <TouchableOpacity onPress={() => setShowLinkInput(false)} style={{ marginRight:12 }}><Text>İptal</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleAddLink}><Text style={{ color:'#4C6EF5' }}>Ekle</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Kategori ekleme modalı */}
      <Modal visible={showAddCategoryModal} transparent animationType="fade">
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.2)', justifyContent:'center', alignItems:'center' }}>
          <View style={{ backgroundColor:'#fff', borderRadius:12, padding:24, minWidth:240 }}>
            <Text style={{ fontWeight:'bold', fontSize:16, marginBottom:12 }}>Yeni Kategori Ekle</Text>
            <TextInput value={newCategoryName} onChangeText={setNewCategoryName} placeholder="Kategori adı girin" style={{ borderWidth:1, borderColor:'#eee', borderRadius:8, padding:8, marginBottom:12 }} />
            <View style={{ flexDirection:'row', justifyContent:'flex-end' }}>
              <TouchableOpacity onPress={() => setShowAddCategoryModal(false)} style={{ marginRight:12 }}><Text>İptal</Text></TouchableOpacity>
              <TouchableOpacity onPress={async () => {
                if (!newCategoryName.trim()) return;
                setAddingCategory(true);
                try {
                  await addCategory(newCategoryName.trim(), '#868E96');
                  setTimeout(() => {
                    const added = categories.find((c) => c.name === newCategoryName.trim());
                    if (added) setCategoryId(added.id);
                  }, 500);
                  setShowAddCategoryModal(false);
                  setNewCategoryName('');
                } finally {
                  setAddingCategory(false);
                }
              }}><Text style={{ color:'#4C6EF5' }}>Ekle</Text></TouchableOpacity>
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
  contentInput: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
    minHeight: 200,
    color: COLORS.text.primary,
    textAlignVertical: 'top',
    marginBottom: 16,
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
  drawingArea: {
    height: 300,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    margin: 16,
    borderRadius: 8,
  },
  drawingTools: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  toolRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  toolButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  colorPicker: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#000000',
  },
});

export default NoteDetailScreen;