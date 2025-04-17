import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { NotesIcon, StarIcon } from '../icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants/theme';

interface CardProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  isImportant?: boolean;
  style?: ViewStyle;
  animationDelay?: number;
  categoryColor?: string; // Bu renk string tipinde olsun
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  onPress,
  isImportant = false,
  style,
  animationDelay = 0,
  categoryColor,
}) => {
  const scale = useSharedValue(0);

  React.useEffect(() => {
    // animasyon gecikmesi
    const timeout = setTimeout(() => {
      scale.value = withSpring(1);
    }, animationDelay);

    return () => clearTimeout(timeout);
  }, [animationDelay, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      style={[styles.container, animatedStyle, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View
          style={[
            styles.iconContainer,
            categoryColor ? { backgroundColor: `${categoryColor}20` } : null,
          ]}
        >
          <NotesIcon size={24} color={categoryColor ?? COLORS.primary.main} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title as TextStyle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle as TextStyle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        {isImportant && (
          <StarIcon size={20} color={COLORS.warning.main} />
        )}
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.paper,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.xs,
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
});

export default Card;
