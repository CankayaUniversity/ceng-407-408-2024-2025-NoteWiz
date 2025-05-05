import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { DocumentViewScreenRouteProp, DocumentViewScreenNavigationProp } from '../types/navigation';
import { useDocuments } from '../contexts/DocumentContext';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { CloseIcon, DeleteIcon } from '../components/icons';
import Pdf from 'react-native-pdf';

const DocumentViewScreen = () => {
  const route = useRoute<DocumentViewScreenRouteProp>();
  const navigation = useNavigation<DocumentViewScreenNavigationProp>();
  const { documentId, title } = route.params;
  const { getDocument, deleteDocument, extractText } = useDocuments();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  useEffect(() => {
    loadDocument();
  }, []);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const doc = await getDocument(documentId);
      setDocument(doc);
      
      // Extract text if not already extracted
      if (!doc.extractedText) {
        const text = await extractText(documentId);
        setExtractedText(text);
      } else {
        setExtractedText(doc.extractedText);
      }
    } catch (err) {
      console.error('Error loading document:', err);
      setError('Doküman yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Dokümanı Sil',
      'Bu dokümanı silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(documentId);
              navigation.goBack();
            } catch (err) {
              console.error('Error deleting document:', err);
              Alert.alert('Hata', 'Doküman silinirken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleDelete}
          >
            <DeleteIcon size={24} color={COLORS.error.main} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <CloseIcon size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {document?.filePath && (
          <View style={styles.pdfContainer}>
            <Pdf
              source={{ uri: document.filePath }}
              style={styles.pdf}
              onLoadComplete={(numberOfPages) => {
                console.log(`PDF loaded: ${numberOfPages} pages`);
              }}
              onError={(error) => {
                console.error('PDF error:', error);
                setError('PDF yüklenirken bir hata oluştu');
              }}
            />
          </View>
        )}

        {extractedText && (
          <View style={styles.textContainer}>
            <Text style={styles.sectionTitle}>Çıkarılan Metin</Text>
            <Text style={styles.textContent}>{extractedText}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.paper,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.error.main,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  title: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  pdfContainer: {
    flex: 1,
    minHeight: 500,
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: 500,
  },
  textContainer: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h6,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  textContent: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
});

export default DocumentViewScreen; 