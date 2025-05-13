import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { StarIcon } from '../icons';
import { COLORS, SHADOWS, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { CategoryType } from '../../constants/theme';

interface ImportantNoteCardProps {
  note: {
    id: string;
    title: string;
    content: string;
    category: string;
    updatedAt: Date;
  };
  index: number;
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const ImportantNoteCard: React.FC<ImportantNoteCardProps> = ({
  note,
  index,
  onPress,
}) => {
  // 1) Scale animasyonu
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  // 2) Transform stili: Bunu ayrıştırıyoruz
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Kategori rengini hesapla
  const categoryColor =
    COLORS.categories[note.category.toLowerCase() as CategoryType] ??
    COLORS.categories.other;

  return (
    // A) Dış katmanda FADE animasyonu
    <AnimatedTouchable
      entering={FadeInRight.delay(index * 100).springify()}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      {/* B) İç katmanda transform stili */}
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.cardContent}>
          {/* Başlık ve Tarih */}
          <View style={styles.header}>
            <View style={styles.starContainer}>
              <StarIcon size={16} color={COLORS.warning.main} />
            </View>
            <Text style={styles.date}>
              {new Date(note.updatedAt).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>

          {/* Not Başlığı */}
          <Text style={styles.title} numberOfLines={2}>
            {note.title}
          </Text>

          {/* Not İçeriği Önizlemesi */}
          <Text style={styles.preview} numberOfLines={2}>
            {note.content}
          </Text>

          {/* Kategori Etiketi */}
          <View style={styles.categoryContainer}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: `${categoryColor}20` },
              ]}
            >
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {note.category}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    marginRight: 16,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background.paper,
    ...SHADOWS.md,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning.light + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  date: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
    lineHeight: 24,
  },
  preview: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
  },
});
