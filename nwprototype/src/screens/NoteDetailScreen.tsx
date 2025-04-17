// src/screens/NoteDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useNotes } from '../contexts/NotesContext';
import { StarIcon } from '../components/icons';

const CATEGORIES = [
  'Work',
  'Personal',
  'Shopping',
  'Ideas',
  'To-Do',
  'Other',
];

type NoteDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NoteDetail'>;
type NoteDetailScreenRouteProp = RouteProp<RootStackParamList, 'NoteDetail'>;

const NoteDetailScreen = () => {
  const navigation = useNavigation<NoteDetailScreenNavigationProp>();
  const route = useRoute<NoteDetailScreenRouteProp>();
  const { addNote, updateNote, deleteNote } = useNotes();
  const [isLoading, setIsLoading] = useState(false);

  const noteId = route.params?.noteId;
  const [title, setTitle] = useState(route.params?.title || '');
  const [content, setContent] = useState(route.params?.content || '');
  const [category, setCategory] = useState(route.params?.category || 'Other');
  const [isImportant, setIsImportant] = useState(route.params?.isImportant || false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Drawing', { noteId: undefined })}
          >
            <Text style={styles.headerButtonText}>✏️ Draw</Text>
          </TouchableOpacity>
          {noteId && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleDelete}
            >
              <Text style={styles.headerButtonTextDelete}>Delete</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleSave}
          >
            <Text style={styles.headerButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, title, content, category, isImportant]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Warning', 'Please enter a title');
      return;
    }

    setIsLoading(true);
    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        category,
        isImportant,
      };

      if (noteId) {
        await updateNote(noteId, noteData);
      } else {
        await addNote(noteData);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'An error occurred while saving the note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              if (!noteId) {
                throw new Error('Note ID is missing');
              }
              await deleteNote(noteId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'An error occurred while deleting the note');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4C6EF5" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.starButton}
            onPress={() => setIsImportant(!isImportant)}
          >
            <StarIcon
              size={24}
              color={isImportant ? '#FFD700' : '#CCCCCC'}
            />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TextInput
          style={styles.contentInput}
          placeholder="Note content..."
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  headerButtonText: {
    color: '#4C6EF5',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButtonTextDelete: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  starButton: {
    padding: 8,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingBottom: 8,
    color: '#1A1A1A',
  },
  categoryContainer: {
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
  },
  categoryButtonActive: {
    backgroundColor: '#4C6EF5',
  },
  categoryText: {
    color: '#666666',
    fontSize: 14,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
    minHeight: 200,
    color: '#333333',
  },
});

export default NoteDetailScreen;