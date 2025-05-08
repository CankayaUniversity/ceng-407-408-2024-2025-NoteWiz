import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import * as Progress from 'react-native-progress';
import { apiClient as newApi } from '../services/newApi';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

interface DocumentUploaderProps {
  onUploadComplete?: () => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUploadComplete }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });

      if (result.length > 0) {
        await uploadDocument(result[0]);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // Kullanıcı iptal etti
      } else {
        Alert.alert('Hata', 'Döküman seçilirken bir hata oluştu');
      }
    }
  };

  const uploadDocument = async (document: any) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', {
        uri: document.uri,
        type: document.type,
        name: document.name,
      });

      const response = await newApi.post('/Document/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = progressEvent.loaded / progressEvent.total;
            setUploadProgress(progress);
          }
        },
      });

      Alert.alert('Başarılı', 'Döküman başarıyla yüklendi');
      if (onUploadComplete) {
        onUploadComplete();
      }
      navigation.navigate('TabNavigator');
    } catch (error) {
      Alert.alert('Hata', 'Döküman yüklenirken bir hata oluştu');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TouchableOpacity
        onPress={handleDocumentPick}
        disabled={isUploading}
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
        }}>
        <Text style={{ color: 'white', fontSize: 16 }}>
          {isUploading ? 'Yükleniyor...' : 'PDF Seç'}
        </Text>
      </TouchableOpacity>

      {isUploading && (
        <View style={{ marginTop: 20 }}>
          <Progress.Bar progress={uploadProgress} width={200} />
          <Text style={{ marginTop: 10, textAlign: 'center' }}>
            {Math.round(uploadProgress * 100)}%
          </Text>
        </View>
      )}
    </View>
  );
};

export default DocumentUploader; 