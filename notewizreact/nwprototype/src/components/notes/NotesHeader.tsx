// src/components/notes/NotesHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import { SearchBar } from '../ui/SearchBar';

interface NotesHeaderProps {
  totalNotes: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const NotesHeader: React.FC<NotesHeaderProps> = ({
  totalNotes,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>My Notes</Text>
        <Text style={styles.subtitle}>{totalNotes} notes</Text>
      </View>
      <SearchBar
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder="Search notes..."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : StatusBar.currentHeight! + 20,
    paddingBottom: 20,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});