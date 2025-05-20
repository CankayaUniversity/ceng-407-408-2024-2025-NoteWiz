// src/components/notes/NoteCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, ImageStyle, StyleProp, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { StarIcon, NotesIcon, PdfIcon } from '../icons';
import { COLORS, SHADOWS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';

interface NoteCardProps {
  note: {
    id: string;
    title: string;
    content: string;
    isImportant: boolean;
    updatedAt: Date;
    // PDF properties
    isPdf?: boolean;
    pdfUrl?: string;
    pdfName?: string;
    // Cover image
    coverImage?: any; // This would be a source object
  };
  category?: {
    id: string;
    name: string;
    color?: string;
  };
  onPress: () => void;
  onLongPress?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  category, 
  onPress, 
  onLongPress 
}) => {
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

  // Check if the note has a cover image
  const hasCover = note.coverImage !== undefined && note.coverImage !== null;
  const isPdf = note.isPdf;

  return (
    <AnimatedTouchable
      style={[
        styles.container,
        note.isImportant && styles.importantContainer,
        animatedStyle
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      delayLongPress={300}
    >
      {/* Cover image if present */}
      {hasCover && (
        <View style={styles.coverImageContainer}>
          <Image 
            source={note.coverImage} 
            style={styles.coverImage}
            resizeMode="cover"
          />
          {isPdf && (
            <View style={styles.pdfBadge}>
              <PdfIcon size={16} color="#FFFFFF" />
            </View>
          )}
        </View>
      )}

      <View style={[styles.content, hasCover && styles.contentWithCover]}>
        {/* Icon on the left */}
        <View style={[
          styles.iconContainer,
          { backgroundColor: `${categoryColor}20` }
        ]}>
          {note.isPdf ? (
            <PdfIcon
              size={24}
              color={categoryColor}
            />
          ) : (
            <NotesIcon
              size={24}
              color={categoryColor}
            />
          )}
        </View>

        {/* Middle section - title and content */}
        <View style={styles.textContainer}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {note.title}
            </Text>
            {note.isImportant && (
              <View style={styles.importantBadge}>
                <Text style={styles.importantText}>!</Text>
              </View>
            )}
          </View>
<<<<<<< HEAD
          {/* Kategori etiketi */}
          {category?.name && (
            <View style={{
              alignSelf: 'flex-start',
              backgroundColor: category.color || '#eee',
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 2,
              marginBottom: 4,
              marginTop: 2,
            }}>
              <Text style={{
                color: '#fff',
                fontSize: 12,
                fontWeight: 'bold'
              }}>
                {category.name}
              </Text>
            </View>
          )}
=======
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
          
          {/* For PDFs show the filename, for notes show content preview */}
          {note.isPdf ? (
            <View style={styles.pdfPreview}>
              <Text style={styles.preview} numberOfLines={1}>
                {note.pdfName || 'PDF Document'}
              </Text>
            </View>
          ) : (
            <Text style={styles.preview} numberOfLines={2}>
              {note.content}
            </Text>
          )}

          <View style={styles.footer}>
<<<<<<< HEAD
=======
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
              <Text style={[styles.category, { color: categoryColor }]}>
                {category?.name || 'Uncategorized'}
              </Text>
            </View>
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
            <Text style={styles.date}>
              {new Date(note.updatedAt).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </Text>
          </View>
        </View>

        {/* Important star icon */}
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
    overflow: 'hidden',
    ...SHADOWS.md
  } as ViewStyle,
  importantContainer: {
    borderWidth: 1,
    borderColor: COLORS.warning.light + '30',
  } as ViewStyle,
  coverImageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  } as ViewStyle,
  coverImage: {
    width: '100%',
    height: '100%',
  } as ImageStyle,
  pdfBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: SPACING.xs,
  } as ViewStyle,
  content: {
    flexDirection: 'row',
    padding: SPACING.md,
  } as ViewStyle,
  contentWithCover: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  } as ViewStyle,
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  } as ViewStyle,
  textContainer: {
    flex: 1,
    marginRight: SPACING.md,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  } as ViewStyle,
  title: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold as "600",
    color: COLORS.text.primary,
    flex: 1,
    marginRight: SPACING.xs,
  } as TextStyle,
  importantBadge: {
    backgroundColor: COLORS.error.main,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  importantText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  } as TextStyle,
  preview: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  } as TextStyle,
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
<<<<<<< HEAD
=======
  categoryBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  } as ViewStyle,
  category: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium as "500",
  } as TextStyle,
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
  star: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  } as ViewStyle,
  pdfPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  } as ViewStyle
});

export default NoteCard;