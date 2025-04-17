// src/components/auth/SocialButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface SocialButtonProps {
  type: 'google' | 'apple';
  onPress: () => void;
}

export const SocialButton: React.FC<SocialButtonProps> = ({ type, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon
        name={type === 'google' ? 'google' : 'apple'}
        size={24}
        color={type === 'google' ? '#DB4437' : '#000000'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});