import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  style,
}) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'elevated':
        return [styles.card, styles.elevatedCard];
      case 'outlined':
        return [styles.card, styles.outlinedCard];
      case 'flat':
        return [styles.card, styles.flatCard];
      default:
        return styles.card;
    }
  };

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  elevatedCard: {
    ...shadows.md,
  },
  outlinedCard: {
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  flatCard: {
    backgroundColor: colors.gray[100],
  },
}); 