import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, ScrollView, SafeAreaView, Dimensions, Platform } from 'react-native';
import FolderList, { Folder } from '../components/folders/FolderList';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCategories } from '../contexts/CategoriesContext';


const initialFolders: Folder[] = [
  { id: '1', name: 'Genel', color: '#4C6EF5', icon: 'folder' },
];
const initialNotes = [
  { id: 'n1', title: 'Not 1', folderId: '1' },
  { id: 'n2', title: 'Not 2', folderId: '1' },
  { id: 'n3', title: 'Arşiv Notu', folderId: '2' },
];

const FoldersScreen = () => {
  const { addCategory } = useCategories();
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [notes, setNotes] = useState(initialNotes);
  const [search, setSearch] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#4C6EF5');
  const [newFolderIcon, setNewFolderIcon] = useState('folder');
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [moveNoteId, setMoveNoteId] = useState<string | null>(null);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const addFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await addCategory(newFolderName, newFolderColor);
      setNewFolderName('');
    } catch (err) {
      Alert.alert('Klasör eklenemedi', 'Bir hata oluştu.');
    }
  };

  const deleteFolder = (id: string) => {
    setFolders(folders.filter(f => f.id !== id));
    setNotes(notes.filter(n => n.folderId !== id));
  };

  const moveNote = (noteId: string, targetFolderId: string) => {
    setNotes(notes.map(n => n.id === noteId ? { ...n, folderId: targetFolderId } : n));
    setUndoStack([...undoStack, {notes: [...notes]}]);
  };

  const moveSelectedNotes = (targetFolderId: string) => {
    setNotes(notes.map(n => selectedNotes.includes(n.id) ? { ...n, folderId: targetFolderId } : n));
    setSelectedNotes([]);
  };

  const undo = () => {
    const last = undoStack.pop();
    if (last) setNotes(last.notes);
    setUndoStack([...undoStack]);
  };

  const getAIFolderSuggestion = async (folder: Folder) => {
    // Dummy AI suggestion
    Alert.alert('AI Önerisi', 'Etiket: Örnek');
  };

  const handleFolderPress = (id: string) => {
    setExpandedFolderId(expandedFolderId === id ? null : id);
  };

  const addNoteToFolder = (folderId: string) => {
    if (!newNoteTitle.trim() && !newNoteContent.trim()) return;
    setNotes([...notes, { id: Date.now().toString(), title: newNoteTitle.trim(), content: newNoteContent.trim(), folderId }]);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  // Responsive ölçüler
  const { width } = Dimensions.get('window');
  const isTablet = width > 700;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        {/* Arama kutusu */}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Klasör veya not ara..."
          style={styles.searchInput}
        />
        {/* Klasör ekleme alanı */}
        <View style={styles.addFolderRow}>
          <TextInput
            value={newFolderName}
            onChangeText={setNewFolderName}
            placeholder="Yeni klasör adı"
            style={styles.folderInput}
          />
          <TouchableOpacity style={styles.addButton} onPress={addFolder}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ekle</Text>
          </TouchableOpacity>
        </View>
        {/* Renk seçimi ve ikon seçimi */}
        <View style={styles.colorRow}>
          {['#4C6EF5','#FFD43B','#63E6BE','#FF8787','#845EF7','#FFA94D'].map(color => (
            <TouchableOpacity
              key={color}
              style={[styles.colorCircle, { backgroundColor: color, borderWidth: newFolderColor === color ? 2 : 0 }]}
              onPress={() => setNewFolderColor(color)}
            />
          ))}
          {(['folder','archive','star','document'] as const).map(icon => (
            <TouchableOpacity key={icon} onPress={() => setNewFolderIcon(icon)} style={{ marginHorizontal: 4 }}>
              <Icon name={typeof icon === 'string' && ["folder","description","note","insert-drive-file"].includes(icon) ? icon : 'folder'} size={22} color={newFolderIcon === icon ? '#222' : '#AAA'} />
            </TouchableOpacity>
          ))}
        </View>
        {/* Klasörler listesi */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 12 }}>
          {filteredFolders.map(folder => (
            <View key={folder.id}>
              <TouchableOpacity style={[styles.folderCard, { backgroundColor: folder.color || '#F1F3F5' }] } onPress={() => handleFolderPress(folder.id)}>
                <Icon name={typeof folder.icon === 'string' && ["folder","description","note","insert-drive-file"].includes(folder.icon) ? folder.icon : 'folder'} size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.folderName}>{folder.name}</Text>
                <TouchableOpacity onPress={() => deleteFolder(folder.id)}>
                  <Text style={styles.deleteBtn}>Sil</Text>
                </TouchableOpacity>
              </TouchableOpacity>
              {/* Notlar ve not ekleme alanı */}
              {expandedFolderId === folder.id && (
                <View style={styles.notesSection}>
                  {notes.filter(n => n.folderId === folder.id).map(note => (
                    <View key={note.id} style={styles.noteCard}>
                      <Text style={styles.noteTitle}>{note.title}</Text>
                      <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={() => setNotes(notes.filter(n => n.id !== note.id))}>
                          <Text style={{ color: '#FF6B6B', marginLeft: 8 }}>Sil</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setMoveNoteId(note.id); setShowFolderPicker(true); }}>
                          <Text style={{ color: '#4C6EF5', marginLeft: 8 }}>Taşı</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  <View style={styles.addNoteRow}>
                    <TextInput
                      value={newNoteTitle}
                      onChangeText={setNewNoteTitle}
                      placeholder="Yeni not başlığı"
                      style={styles.noteInput}
                    />
                    <TextInput
                      value={newNoteContent}
                      onChangeText={setNewNoteContent}
                      placeholder="Yeni not içeriği"
                      style={styles.noteInput}
                    />
                    <TouchableOpacity style={styles.addNoteBtn} onPress={() => addNoteToFolder(folder.id)}>
                      <Text style={{ color: '#fff' }}>Ekle</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
          {filteredFolders.length === 0 && (
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>Klasör bulunamadı.</Text>
          )}
        </ScrollView>
      </View>
      {showFolderPicker && (
        <Modal>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center' }}>
            <FlatList
              data={folders}
              renderItem={({item}) => (
                <TouchableOpacity onPress={() => {
                  if (moveNoteId) moveNote(moveNoteId, item.id);
                  setShowFolderPicker(false);
                }} style={{ padding: 16 }}>
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
            />
            <TouchableOpacity onPress={() => setShowFolderPicker(false)} style={{ alignSelf: 'center', margin: 16 }}>
              <Text style={{ color: '#4C6EF5' }}>Kapat</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    fontSize: 16,
  },
  addFolderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  folderInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#4C6EF5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
    borderColor: '#333',
  },
  folderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  folderName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  deleteBtn: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 12,
  },
  notesSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    marginLeft: 24,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  noteTitle: {
    fontSize: 15,
    color: '#333',
  },
  addNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  noteInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff',
    fontSize: 15,
    marginRight: 8,
  },
  addNoteBtn: {
    backgroundColor: '#4C6EF5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
});

export default FoldersScreen; 