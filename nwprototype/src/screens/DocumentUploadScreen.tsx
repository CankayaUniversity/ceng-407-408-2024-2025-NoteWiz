import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useDocuments } from '../contexts/DocumentContext';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { PdfIcon, CloseIcon } from '../components/icons';

type DocumentUploadScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DocumentUpload'>;

const DocumentUploadScreen = () => {
  const navigation = useNavigation<DocumentUploadScreenNavigationProp>();
  const { uploadDocument, loading, error } = useDocuments();
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });

      const selectedFile = result[0];
      
      Alert.alert(
        'Dosya Seçildi',
        `"${selectedFile.name}" dosyası seçildi. Yüklemek istiyor musunuz?`,
        [
          {
            text: 'İptal',
            style: 'cancel',
          },
          {
            text: 'Yükle',
            onPress: () => handleUpload(selectedFile),
          },
        ]
      );
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('Kullanıcı dosya seçimini iptal etti');
      } else {
        console.error('Dosya seçim hatası:', err);
        Alert.alert('Hata', 'Dosya seçilirken bir hata oluştu');
      }
    }
  };

  const handleUpload = async (file: any) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);

      await uploadDocument({
        file: {
          uri: file.uri,
          type: file.type,
          name: file.name,
        },
      });

      Alert.alert('Başarılı', 'Dosya başarıyla yüklendi');
      navigation.goBack();
    } catch (err) {
      console.error('Yükleme hatası:', err);
      Alert.alert('Hata', 'Dosya yüklenirken bir hata oluştu');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Doküman Yükle</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <CloseIcon size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleDocumentPick}
          disabled={loading}
        >
          <PdfIcon size={32} color={COLORS.primary.main} />
          <Text style={styles.uploadButtonText}>
            {loading ? 'Yükleniyor...' : 'PDF Seç'}
          </Text>
        </TouchableOpacity>

        {loading && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color={COLORS.primary.main} />
            <Text style={styles.progressText}>
              Yükleme: {Math.round(uploadProgress)}%
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.paper,
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
  },
  closeButton: {
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    padding: SPACING.lg,
    borderRadius: 12,
    ...SHADOWS.md,
  },
  uploadButtonText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.primary.main,
    marginLeft: SPACING.sm,
  },
  progressContainer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  progressText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
  },
  errorContainer: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.error.light,
    borderRadius: 8,
  },
  errorText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.error.main,
  },
});

export default DocumentUploadScreen; 