// src/components/drawing/DrawingTools.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './steyles';

interface DrawingToolsProps {
  selectedTool: 'pen' | 'highlighter' | 'eraser';
  onSelectTool: (tool: 'pen' | 'highlighter' | 'eraser') => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
}

export const DrawingTools: React.FC<DrawingToolsProps> = ({
  selectedTool,
  onSelectTool,
  strokeWidth,
  onStrokeWidthChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tools</Text>
      
      <View style={styles.toolRow}>
        <TouchableOpacity
          style={[styles.toolButton, selectedTool === 'pen' && styles.toolButtonActive]}
          onPress={() => onSelectTool('pen')}
        >
          <Icon name="edit-2" size={24} color={selectedTool === 'pen' ? "#4C6EF5" : "#666666"} />
          <Text style={[styles.toolText, selectedTool === 'pen' && styles.toolTextActive]}>
            Pen
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButton, selectedTool === 'highlighter' && styles.toolButtonActive]}
          onPress={() => onSelectTool('highlighter')}
        >
          <Icon name="edit" size={24} color={selectedTool === 'highlighter' ? "#4C6EF5" : "#666666"} />
          <Text style={[styles.toolText, selectedTool === 'highlighter' && styles.toolTextActive]}>
            Highlighter
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButton, selectedTool === 'eraser' && styles.toolButtonActive]}
          onPress={() => onSelectTool('eraser')}
        >
          <MaterialCommunityIcons name="eraser" size={24} color={selectedTool === 'eraser' ? "#4C6EF5" : "#666666"} />
          <Text style={[styles.toolText, selectedTool === 'eraser' && styles.toolTextActive]}>
            Eraser
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Thickness</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={20}
          value={strokeWidth}
          onValueChange={onStrokeWidthChange}
          minimumTrackTintColor="#4C6EF5"
          maximumTrackTintColor="#E5E5E5"
          thumbTintColor="#4C6EF5"
        />
        <View style={styles.sliderValues}>
          <Text style={styles.sliderValueText}>Thin</Text>
          <Text style={styles.sliderValueText}>Thick</Text>
        </View>
      </View>
    </View>
  );
};


