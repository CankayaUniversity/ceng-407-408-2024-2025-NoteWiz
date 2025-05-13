// src/components/notes/EmptyState.tsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NotesIcon } from '../icons';
import Animated, { FadeIn } from 'react-native-reanimated';

interface EmptyStateProps {
  query: string;
  selectedCategory: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ query, selectedCategory }) => {
  const getMessage = () => {
    if (query) {
      return `No notes found matching "${query}"`;
    }
    if (selectedCategory !== 'All') {
      return `No notes in ${selectedCategory} category`;
    }
    return 'No notes yet';
  };

  return (
    <Animated.View 
      entering={FadeIn}
      style={styles.container}
    >
      <NotesIcon size={64} color="#CCCCCC" />
      <Text style={styles.title}>{getMessage()}</Text>
      <Text style={styles.subtitle}>
        Tap the + button to create your first note
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});