import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { CreateIcon } from '../icons';
import { COLORS, SHADOWS } from '../../constants/theme';

interface FABProps {
  onPress: () => void;
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FABProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <CreateIcon size={24} color={COLORS.text.inverted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
});
