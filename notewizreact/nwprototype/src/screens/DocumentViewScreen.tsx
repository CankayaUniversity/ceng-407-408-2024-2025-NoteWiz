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
import { CloseIcon, DeleteIcon, EditIcon } from '../components/icons';
import Pdf from 'react-native-pdf';

// Types
interface DocumentViewProps {
  documentId: string;
  title: string;
}

const DocumentViewScreen = () => {
  // Navigation and Route
  const route = useRoute<DocumentViewScreenRouteProp>();
  const navigation = useNavigation<DocumentViewScreenNavigationProp>();
  const { documentId, title } = route.params;

  // Context
  const { getDocument, deleteDocument, extractText, updateDocument } = useDocuments();

  // State
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Effects
  useEffect(() => {
    loadDocument();
  }, []);

  // Handlers
  const loadDocument = async () => {
    try {
      setLoading(true);
      const doc = await getDocument(documentId);
      setDocument(doc);
      
      if (!doc.content) {
        const text = await extractText(documentId);
        setExtractedText(text);
      } else {
        setExtractedText(doc.content);
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

  const handleEdit = () => {
    setIsEditing(true);
    navigation.navigate('DocumentEdit', { documentId, document });
  };

  // Render Methods
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
        <CloseIcon color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerButtons}>
        <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
          <EditIcon color={COLORS.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
          <DeleteIcon color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
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
      <ScrollView style={styles.content}>
        {document?.filePath && (
          <Pdf
            source={{ uri: document.filePath }}
            style={styles.pdf}
            onLoadComplete={(numberOfPages, filePath) => {
              console.log(`Number of pages: ${numberOfPages}`);
            }}
            onError={(error) => {
              console.log(error);
            }}
          />
        )}
        {extractedText && (
          <View style={styles.textContainer}>
            <Text style={styles.text}>{extractedText}</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderContent()}
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h2,
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  content: {
    flex: 1,
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
    color: COLORS.error,
    textAlign: 'center',
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: 500,
  },
  textContainer: {
    padding: SPACING.md,
  },
  text: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
});

export default DocumentViewScreen; 