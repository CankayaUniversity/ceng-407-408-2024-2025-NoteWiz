// src/components/notes/NoteCoverPicker.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  SafeAreaView,
  Platform,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { CloseIcon } from '../icons';
import { COLORS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

// Kapak kategorileri ve seçenekleri
const COVER_OPTIONS = {
  basic: [
    { id: 'none', type: 'basic', image: null, color: '#FFFFFF' },
    { id: 'basic-black', type: 'basic', image: null, color: '#000000' },
  ],
  illust: [
    { id: 'gradient-blue', type: 'illust', image: require('../../assets/images/gradient-blue.png') },
    { id: 'ai-cover', type: 'illust', image: require('../../assets/images/ai-cover.png') },
    { id: 'ai-cover2', type: 'illust', image: require('../../assets/images/ai-cover2.png') },
    { id: 'blue-sky', type: 'illust', image: require('../../assets/images/blue-sky.png') },
  ],
  pastel: [
    { id: 'pastel-pink', type: 'pastel', image: null, color: '#FFE4E1' },
    { id: 'pastel-blue', type: 'pastel', image: null, color: '#E0FFFF' },
    { id: 'pastel-green', type: 'pastel', image: null, color: '#E0FFF0' },
  ]
};

interface NoteCoverPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectCover: (coverId: string, coverColor?: string) => void;
  selectedCoverId: string;
  noteTitle?: string;
  noteContent?: string;
}

const NoteCoverPicker: React.FC<NoteCoverPickerProps> = ({
  visible,
  onClose,
  onSelectCover,
  selectedCoverId,
  noteTitle,
  noteContent,
}) => {
  const [activeCategory, setActiveCategory] = useState<'none' | 'basic' | 'illust' | 'pastel' | 'pattern' | 'generated'>('none');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCover = async () => {
    if (!noteTitle && !noteContent) {
      // Başlık veya içerik yoksa uyarı göster
      return;
    }

    setIsGenerating(true);
    try {
      // AI API'sine istek at
      const response = await fetch('your-ai-api-endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent,
        }),
      });

      const data = await response.json();
      onSelectCover('generated', data.coverUrl);
    } catch (error) {
      console.error('Error generating cover:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Choose Cover</Text>
          
          <ScrollView style={styles.scrollView}>
            {/* Kapak Yok Seçeneği */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>No Cover</Text>
              <TouchableOpacity
                style={[
                  styles.coverOption,
                  selectedCoverId === 'none' && styles.selectedOption,
                ]}
                onPress={() => onSelectCover('none', undefined)}
              >
                <Text style={styles.coverOptionText}>None</Text>
              </TouchableOpacity>
            </View>

            {/* Basic Kapaklar */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.coverGrid}>
                  {COVER_OPTIONS.basic.map((cover) => (
                    <TouchableOpacity
                      key={cover.id}
                      style={[
                        styles.coverPreview,
                        { backgroundColor: cover.color },
                        selectedCoverId === cover.id && styles.selectedCover,
                      ]}
                      onPress={() => onSelectCover(cover.id, cover.color)}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* İllüstrasyon Kapaklar */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Illust</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.coverGrid}>
                  {COVER_OPTIONS.illust.map((cover) => (
                    <TouchableOpacity
                      key={cover.id}
                      style={[
                        styles.coverPreview,
                        selectedCoverId === cover.id && styles.selectedCover,
                      ]}
                      onPress={() => onSelectCover(cover.id)}
                    >
                      <Image source={cover.image} style={styles.coverImage} />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* AI ile Kapak Oluşturma */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Generate Cover</Text>
              <TouchableOpacity
                style={[
                  styles.generateButton,
                  isGenerating && styles.generatingButton,
                ]}
                onPress={handleGenerateCover}
                disabled={isGenerating || (!noteTitle && !noteContent)}
              >
                {isGenerating ? (
                  <ActivityIndicator color={COLORS.text.primary} />
                ) : (
                  <Text style={styles.generateButtonText}>
                    Generate from Content
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.background.default,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  scrollView: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  coverOption: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.background.surface,
  },
  selectedOption: {
    backgroundColor: COLORS.primary.main,
  },
  coverOptionText: {
    fontSize: 16,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  coverGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  coverPreview: {
    width: 100,
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  selectedCover: {
    borderWidth: 2,
    borderColor: COLORS.primary.main,
  },
  generateButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary.main,
    alignItems: 'center',
  },
  generatingButton: {
    opacity: 0.7,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: COLORS.background.surface,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
});

export default NoteCoverPicker;