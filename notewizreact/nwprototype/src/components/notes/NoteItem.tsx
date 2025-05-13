import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { Note } from '../../types/note';

interface NoteItemProps {
  note: Note;
  onPress: () => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onPress }) => {
  const getCoverStyle = () => {
    if (note.coverId === 'none') {
      return { backgroundColor: '#F5F5F5' };
    }
    
    if (note.coverColor) {
      return { backgroundColor: note.coverColor };
    }
    
    return {};
  };

  return (
    <TouchableOpacity
      style={[styles.container, getCoverStyle()]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {note.coverImage ? (
        <Image
          source={{ uri: note.coverImage }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {note.title}
          </Text>
          <Text style={styles.content} numberOfLines={3}>
            {note.content}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    height: 160,
    ...COLORS.shadow,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default NoteItem; 