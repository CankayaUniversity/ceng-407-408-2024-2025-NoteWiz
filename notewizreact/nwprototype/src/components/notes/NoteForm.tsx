import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { colors } from '../../constants/theme';
import NoteCoverPicker from './NotesCoverPicker';
import { CreateNoteDto, UpdateNoteDto } from '../../types/note';

interface NoteFormProps {
  initialData?: CreateNoteDto | UpdateNoteDto;
  onSubmit: (data: CreateNoteDto | UpdateNoteDto) => void;
  onCancel: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [coverId, setCoverId] = useState(initialData?.coverId || 'none');
  const [coverColor, setCoverColor] = useState<string | undefined>(initialData?.coverColor);
  const [isArchived, setIsArchived] = useState(initialData?.isArchived || false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  const handleSubmit = () => {
    const formData: CreateNoteDto | UpdateNoteDto = {
      title,
      content,
      coverId: coverId === 'none' ? undefined : coverId,
      coverColor,
      isArchived,
    };

    onSubmit(formData);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.coverPreview, coverColor && { backgroundColor: coverColor }]}>
          <TouchableOpacity
            style={styles.coverButton}
            onPress={() => setShowCoverPicker(true)}
          >
            <Text style={styles.coverButtonText}>
              {coverId === 'none' ? 'Select Cover' : 'Change Cover'}
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.titleInput}
          placeholder="Note Title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={colors.gray[500]}
        />

        <TextInput
          style={styles.contentInput}
          placeholder="Note Content"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          placeholderTextColor={colors.gray[500]}
        />

        <TouchableOpacity
          style={styles.archiveButton}
          onPress={() => setIsArchived(!isArchived)}
        >
          <Text style={[styles.buttonText, isArchived && styles.archivedText]}>
            {isArchived ? 'Archived' : 'Archive Note'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
        >
          <Text style={[styles.buttonText, styles.submitButtonText]}>
            {initialData ? 'Update' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      <NoteCoverPicker
        visible={showCoverPicker}
        onClose={() => setShowCoverPicker(false)}
        onSelectCover={(id, color) => {
          setCoverId(id);
          setCoverColor(color);
          setShowCoverPicker(false);
        }}
        selectedCoverId={coverId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  coverPreview: {
    height: 120,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  coverButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 16,
    padding: 8,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
  },
  contentInput: {
    fontSize: 16,
    color: colors.dark,
    padding: 8,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    minHeight: 200,
    marginBottom: 16,
  },
  archiveButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    marginBottom: 16,
  },
  archivedText: {
    color: colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: colors.gray[100],
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.dark,
  },
  submitButtonText: {
    color: colors.white,
  },
});

export default NoteForm; 