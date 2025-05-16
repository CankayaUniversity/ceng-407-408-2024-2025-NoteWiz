import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import MlkitOcr from 'react-native-mlkit-ocr';
import { useNavigation } from '@react-navigation/native';
import { apiClient } from '../services/newApi';

interface MKLBlock {
  text: string;
  confidence: number;
  boundingBox: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
}

const OCRScreen = () => {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const pickImage = async () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
      if (response.didCancel) {
        // Kullanıcı iptal etti
        return;
      } else if (response.errorCode) {
        Alert.alert('Hata', 'Resim seçilemedi: ' + response.errorMessage);
        return;
      } else if (response.assets && response.assets[0].uri) {
        setImage(response.assets[0].uri);
        setText(null);
      }
    });
  };

  const runOcr = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const result = await MlkitOcr.detectFromUri(image) as unknown as MKLBlock[];
      const extractedText = result.map(block => block.text).join('\n').trim();
      if (!extractedText || extractedText.length < 3) {
        Alert.alert('Görüntü çok bulanık veya metin algılanamadı', 'Lütfen daha net bir fotoğraf seçin.');
        setText(null);
      } else {
        setText(extractedText);
        Alert.alert(
          'Metin Çıkarıldı',
          'Bu metni not olarak kaydetmek ister misiniz?',
          [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Kaydet',
              onPress: async () => {
                await apiClient.post('/notes', { title: 'OCR Notu', content: extractedText });
                Alert.alert('Başarılı', 'Notlarınız arasına kaydedildi!');
                navigation.goBack();
              }
            }
          ]
        );
      }
    } catch (err) {
      Alert.alert('Hata', 'OCR sırasında bir hata oluştu.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Görselden Metin Çıkar (OCR)</Text>
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Resim Seç</Text>
      </TouchableOpacity>
      {image && (
        <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
      )}
      {image && (
        <TouchableOpacity style={styles.button} onPress={runOcr} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'OCR Çalışıyor...' : 'Metni Çıkar'}</Text>
        </TouchableOpacity>
      )}
      {text && (
        <View style={styles.textBox}>
          <Text style={styles.textLabel}>Çıkarılan Metin:</Text>
          <Text style={styles.textContent}>{text}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  button: { backgroundColor: '#4C6EF5', borderRadius: 8, padding: 14, alignItems: 'center', marginVertical: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  image: { width: '100%', height: 220, marginVertical: 16, borderRadius: 12 },
  textBox: { backgroundColor: '#F8F9FA', borderRadius: 8, padding: 12, marginTop: 16 },
  textLabel: { fontWeight: 'bold', marginBottom: 4 },
  textContent: { fontSize: 15, color: '#333' },
});

export default OCRScreen;
