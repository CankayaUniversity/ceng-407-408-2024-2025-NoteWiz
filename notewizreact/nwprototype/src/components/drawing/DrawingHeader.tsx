// src/components/drawing/DrawingHeader.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import styles from './steyles';

interface DrawingHeaderProps {
  onBack: () => void;
  onUndo: () => void;
  onClear: () => void;
  onSave: () => void;
  canUndo: boolean;
}

export const DrawingHeader: React.FC<DrawingHeaderProps> = ({
  onBack,
  onUndo,
  onClear,
  onSave,
  canUndo,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.button}>
        <Icon name="arrow-left" size={24} color="#1A1A1A" />
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity 
          onPress={onUndo} 
          style={[styles.button, !canUndo && styles.buttonDisabled]}
          disabled={!canUndo}
        >
          <Icon name="rotate-ccw" size={24} color={canUndo ? "#1A1A1A" : "#999999"} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onClear} style={styles.button}>
          <Icon name="trash-2" size={24} color="#FF3B30" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

