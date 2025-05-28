import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiClient } from '../services/newApi';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PdfDocument = {
  id: string;
  title?: string;
  fileName?: string;
  fileUrl?: string;
  filePath?: string;
  isLocalOnly?: boolean;
  [key: string]: any;
};

const downloadPdfToDevice = async (remoteUrl: string, fileName: string): Promise<string | null> => {
  // If it's already a local file, return the URI directly
  if (remoteUrl.startsWith('file://') || remoteUrl.startsWith('content://')) {
    return remoteUrl;
  }

  const localPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
  try {
    const downloadResult = await RNFS.downloadFile({
      fromUrl: remoteUrl,
      toFile: localPath,
    }).promise;
    if (downloadResult.statusCode === 200) {
      return 'file://' + localPath;
    } else {
      throw new Error('İndirme başarısız');
    }
  } catch (e) {
    console.error('PDF indirme hatası:', e);
    return null;
  }
};

const PdfListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const res = await apiClient.get('/document');
        console.log('API response:', res.data);
        let documents: PdfDocument[] = [];
        if (Array.isArray(res.data)) {
          documents = res.data;
        } else if (Array.isArray(res.data.documents)) {
          documents = res.data.documents;
        } else if (Array.isArray(res.data.data)) {
          documents = res.data.data;
        } else {
          console.error('API response is not an array:', res.data);
        }
        // Local-only PDF'leri AsyncStorage'dan al
        let localPdfs: PdfDocument[] = [];
        try {
          const localPdfsRaw = await AsyncStorage.getItem('localPdfs');
          if (localPdfsRaw) {
            localPdfs = JSON.parse(localPdfsRaw);
          }
        } catch (e) { localPdfs = []; }
        // Hepsini birleştir
        setPdfs([...localPdfs, ...documents]);
      } catch {
        setPdfs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPdfs();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>PDF'lerim</Text>
      <FlatList
        data={pdfs}
        keyExtractor={item => item.id?.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center' }}
            onPress={async () => {
              // Öncelikle fileUrl varsa onu kullan
              let pdfPath = item.fileUrl || '';
              if (!pdfPath && item.filePath) {
                if (item.filePath.startsWith('file://') || item.filePath.startsWith('content://')) {
                  pdfPath = item.filePath;
                } else if (/^https?:\/\//.test(item.filePath)) {
                  pdfPath = item.filePath;
                } else {
                  Alert.alert('PDF bağlantısı yok!', 'Bu PDF sadece backend bilgisayarında mevcut.');
                  return;
                }
              }
              if (!pdfPath) {
                Alert.alert('PDF bağlantısı yok!');
                return;
              }
              // Eğer HTTP(S) ise indirmeden direkt aç
              if (/^https?:\/\//.test(pdfPath)) {
                navigation.navigate('PdfViewerScreen', { pdfUrl: pdfPath });
                return;
              }
              // Eğer zaten cihazda bir dosya ise, direkt aç
              if (pdfPath.startsWith('file://') || pdfPath.startsWith('content://')) {
                navigation.navigate('PdfViewerScreen', { pdfUrl: pdfPath });
                return;
              }
              Alert.alert('PDF bağlantısı geçersiz!', 'PDF açılamıyor.');
            }}
          >
            <Text style={{ fontSize: 16 }}>
              {item.title || item.fileName}
              {item.isLocalOnly ? '  📱' : ''}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>Hiç PDF yok.</Text>}
      />
    </View>
  );
};

export default PdfListScreen; 