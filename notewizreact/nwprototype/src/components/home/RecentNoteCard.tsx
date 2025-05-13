// src/components/home/RecentNoteCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface RecentNoteCardProps {
  note: any; // Note tipini kendi yapınıza göre güncelleyin
  index: number;
  onPress: () => void;
}

export const RecentNoteCard: React.FC<RecentNoteCardProps> = ({ note, index, onPress }) => {
  return (
    <Animated.View
      entering={FadeInRight.delay(100 + index * 100)}
      style={styles.recentCardContainer}
    >
      <TouchableOpacity
        style={styles.recentCard}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.recentCardTitle} numberOfLines={2}>
          {note.title}
        </Text>
        <View style={styles.recentCardFooter}>
          <Text style={styles.recentCardCategory}>{note.category}</Text>
          <Text style={styles.recentCardDate}>
            {new Date(note.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  recentCardContainer: {
    width: '50%',
    padding: 8,
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    height: 140,
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
  recentCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 20,
  },
  recentCardFooter: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  recentCardCategory: {
    fontSize: 12,
    color: '#4C6EF5',
    fontWeight: '500',
    marginBottom: 4,
  },
  recentCardDate: {
    fontSize: 11,
    color: '#666666',
  },
});