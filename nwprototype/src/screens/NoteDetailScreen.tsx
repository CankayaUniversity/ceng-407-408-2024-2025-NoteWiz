// src/screens/NoteDetailScreen.tsx
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useNotes } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';
import { StarIcon } from '../components/icons';
import Pdf from 'react-native-pdf';
import DocumentPicker from 'react-native-document-picker';
import storage from '@react-native-firebase/storage';

const CATEGORIES = [
  'Work',
  'Personal',
  'Shopping',
  'Ideas',
  'To-Do',
  'Other',
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
  const [title, setTitle] = useState(route.params?.title || '');
  const [content, setContent] = useState(route.params?.content || '');
  const [category, setCategory] = useState(route.params?.category || 'Other');
  const [isImportant, setIsImportant] = useState(route.params?.isImportant || false);
  
  // PDF için yeni state'ler
  const [isPdf, setIsPdf] = useState(route.params?.isPdf || false);
  const [pdfUrl, setPdfUrl] = useState(route.params?.pdfUrl || '');
  const [pdfName, setPdfName] = useState(route.params?.pdfName || '');

  // PDF Görüntüleyici Bileşeni
  const PdfViewer = ({ uri }: { uri: string }) => {
    const source = { uri, cache: true };
    return (
      <View style={styles.pdfContainer}>
        <Text style={styles.pdfNameText}>{pdfName || 'PDF Dosyası'}</Text>
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

  // PDF Dosyası Seçme

const selectPdf = async () => {
  try {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.pdf],
    });
    
    console.log('PDF seçildi:', result);
    
    const selectedPdf = result[0];
    
    // PDF seçildiğinde kullanıcıya bu PDF'i kullanmak isteyip istemediğini sor
    Alert.alert(
      'PDF Seçildi',
      `"${selectedPdf.name || 'Adsız PDF'}" dosyası seçildi.`,
      [
        {
          text: 'İptal',
          style: 'cancel',
          onPress: () => {
            // İptal edilirse hiçbir değişiklik yapma - PDF moduna geçme
            console.log('PDF seçimi iptal edildi');
          }
        },
        {
          text: 'Kullan',
          onPress: () => {
            // Kullanıcı onaylarsa PDF moduna geç
            setPdfName(selectedPdf.name || 'Adsız PDF');
            setIsPdf(true);
            setContent('');
            setPdfUrl(selectedPdf.uri);
          }
        }
      ]
    );
    
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      console.log('Kullanıcı dosya seçimini iptal etti');
    } else {
      console.error('Dosya seçim hatası:', err);
    }
  }
};

  // PDF Yükleme
  const uploadPdf = async (pdfUri: string): Promise<string> => {
    if (!user) {
      throw new Error('Kullanıcı girişi yapılmamış');
    }
    
    const fileName = `pdfs/${user.id}/${Date.now()}_${pdfName || 'document.pdf'}`;
    const reference = storage().ref(fileName);
    
    // PDF'i yükle
    await reference.putFile(pdfUri);
    
    // İndirme URL'ini al
    return await reference.getDownloadURL();
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={selectPdf}
          >
            <Text style={styles.headerButtonText}>📄 PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Drawing', { noteId: undefined })}
          >
            <Text style={styles.headerButtonText}>✏️ Draw</Text>
          </TouchableOpacity>
          {noteId && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleDelete}
            >
              <Text style={styles.headerButtonTextDelete}>Delete</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleSave}
          >
            <Text style={styles.headerButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, title, content, category, isImportant, isPdf, pdfUrl, pdfName]);

  const handleSave = async () => {
    if (!isPdf && !title.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir başlık girin');
      return;
    }

    setIsLoading(true);
    try {
      let finalPdfUrl = pdfUrl;
      
      // Eğer yeni bir PDF seçildiyse ve henüz yüklenmediyse
      if (isPdf && pdfUrl && !pdfUrl.startsWith('https://')) {
        // PDF'i Firebase Storage'a yükle
        finalPdfUrl = await uploadPdf(pdfUrl);
      }
      
      const noteData = {
        title: title.trim() || (isPdf ? pdfName : 'Not'),
        content: isPdf ? '' : content.trim(), // PDF ise içerik boş olabilir
        category,
        isImportant,
        isPdf,
        pdfUrl: isPdf ? finalPdfUrl : undefined,
        pdfName: isPdf ? pdfName : undefined,
      };

      if (noteId) {
        await updateNote(noteId, noteData);
      } else {
        await addNote(noteData);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Not kaydetme hatası:', error);
      Alert.alert('Hata', 'Not kaydedilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Notu Sil',
      'Bu notu silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              if (!noteId) {
                throw new Error('Note ID bulunamadı');
              }
              
              // Eğer PDF varsa, Storage'dan da sil
              if (isPdf && pdfUrl) {
                try {
                  // PDF URL'inden Storage yolunu çıkar
                  const storageRef = storage().refFromURL(pdfUrl);
                  await storageRef.delete();
                  console.log('PDF Storage\'dan silindi');
                } catch (storageError) {
                  console.error('PDF silinirken hata:', storageError);
                  // Storage hatası olsa bile notu silmeye devam et
                }
              }
              
              await deleteNote(noteId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Hata', 'Not silinirken bir hata oluştu');
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
        <ActivityIndicator size="large" color="#4C6EF5" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView}>
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
        </View>

        <TextInput
          style={styles.titleInput}
          placeholder={isPdf ? "PDF Başlığı" : "Başlık"}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

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

        {/* PDF veya normal not içeriği */}
        {isPdf && pdfUrl ? (
          <PdfViewer uri={pdfUrl} />
        ) : (
          <TextInput
            style={styles.contentInput}
            placeholder="Not içeriği..."
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        )}
        
        {/* PDF modundayken not-pdf geçişi için buton */}
        {isPdf && (
          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => {
              setIsPdf(false);
              setPdfUrl('');
              setPdfName('');
            }}
          >
            <Text style={styles.switchModeButtonText}>Metin Notuna Dön</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  headerButtonText: {
    color: '#4C6EF5',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButtonTextDelete: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  starButton: {
    padding: 8,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingBottom: 8,
    color: '#1A1A1A',
  },
  categoryContainer: {
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
  },
  categoryButtonActive: {
    backgroundColor: '#4C6EF5',
  },
  categoryText: {
    color: '#666666',
    fontSize: 14,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
    minHeight: 200,
    color: '#333333',
  },
  // PDF Stilleri
  pdfContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 500,
  },
  pdfNameText: {
    padding: 8,
    backgroundColor: '#F5F5F5',
    fontSize: 14,
    color: '#666666',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width - 32,
    height: 500,
    backgroundColor: '#F5F5F5',
  },
  switchModeButton: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  switchModeButtonText: {
    color: '#4C6EF5',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NoteDetailScreen;