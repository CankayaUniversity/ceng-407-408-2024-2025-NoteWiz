// src/components/notes/NoteCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { StarIcon, NotesIcon } from '../icons';
import { COLORS, SHADOWS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';

interface NoteCardProps {
  note: {
    id: string;
    title: string;
    content: string;
    isImportant: boolean;
    updatedAt: Date;
    // PDF özellikleri için eklenen alanlar
    isPdf?: boolean;
    pdfUrl?: string;
    pdfName?: string;
  };
  category?: {
    id: string;
    name: string;
    color?: string;
  };
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const NoteCard: React.FC<NoteCardProps> = ({ note, category, onPress }) => {
  const scale = useSharedValue(1);
  const categoryColor = category?.color || COLORS.categories.other;

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <AnimatedTouchable
      style={[
        styles.container,
        note.isImportant && styles.importantContainer,
        animatedStyle
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <View style={styles.content}>
        {/* Sol taraftaki ikon alanı */}
        <View style={[
          styles.iconContainer,
          { backgroundColor: `${categoryColor}20` }
        ]}>
          {/* PDF ise PDF ikonu göster */}
          {note.isPdf ? (
            <Text style={[styles.pdfIcon, { color: categoryColor }]}>📄</Text>
          ) : (
            <NotesIcon
              size={24}
              color={categoryColor}
            />
          )}
        </View>

        {/* Orta kısım - başlık ve içerik */}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {note.title}
          </Text>
          {/* PDF veya normal not içeriği gösterimi */}
          {note.isPdf ? (
            <View style={styles.pdfPreview}>
              <Text style={styles.preview} numberOfLines={1}>
                {note.pdfName || 'PDF Document'}
              </Text>
            </View>
          ) : (
            <Text style={styles.preview} numberOfLines={1}>
              {note.content}
            </Text>
          )}
          <View style={styles.footer}>
            <Text style={styles.date}>
              {new Date(note.updatedAt).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </Text>
            <Text style={[styles.category, { color: categoryColor }]}>
              {category?.name || 'Uncategorized'}
            </Text>
          </View>
        </View>

        {/* Önemli işareti */}
        {note.isImportant && (
          <StarIcon 
            size={20} 
            color={COLORS.warning.main}
            style={styles.star}
          />
        )}
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.paper,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md
  },
  importantContainer: {
    borderWidth: 1,
    borderColor: COLORS.warning.light + '30',
  },
  content: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    lineHeight: 22,
  },
  preview: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  category: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  star: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  // PDF Stilleri
  pdfIcon: {
    fontSize: 24,
  },
  pdfPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  }
});