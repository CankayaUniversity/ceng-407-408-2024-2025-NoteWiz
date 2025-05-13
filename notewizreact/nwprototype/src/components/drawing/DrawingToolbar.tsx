// src/components/drawing/DrawingToolbar.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { SharedValue } from 'react-native-reanimated';

interface DrawingToolbarProps {
  position: SharedValue<number>;
  selectedTool: 'pen' | 'highlighter' | 'eraser';
  onToolSelect: (tool: 'pen' | 'highlighter' | 'eraser') => void;
}

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  position,
  selectedTool,
  onToolSelect,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.toolButton, selectedTool === 'pen' && styles.toolButtonActive]}
        onPress={() => onToolSelect('pen')}
      >
        <Icon
          name="edit-2"
          size={24}
          color={selectedTool === 'pen' ? '#4C6EF5' : '#666666'}
        />
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={[styles.toolButton, selectedTool === 'highlighter' && styles.toolButtonActive]}
        onPress={() => onToolSelect('highlighter')}
      >
        <Icon
          name="edit"
          size={24}
          color={selectedTool === 'highlighter' ? '#4C6EF5' : '#666666'}
        />
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={[styles.toolButton, selectedTool === 'eraser' && styles.toolButtonActive]}
        onPress={() => onToolSelect('eraser')}
      >
        <Icon
          name="delete"
          size={24}
          color={selectedTool === 'eraser' ? '#4C6EF5' : '#666666'}
        />
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.toolButton}
        onPress={() => {
          position.value = position.value === 0 ? 1 : 0;
        }}
      >
        <Icon name="more-vertical" size={24} color="#666666" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  toolButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolButtonActive: {
    backgroundColor: '#EDF2FF',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 4,
    alignSelf: 'center',
  },
});