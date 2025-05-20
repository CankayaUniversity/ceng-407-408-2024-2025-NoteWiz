import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useNotes } from '../contexts/NoteContext';
import { NoteCard } from '../components/notes/NoteCard';
import { useEffect, useState } from 'react';
import { apiClient } from '../services/newApi';

const FolderDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { notes, moveNoteToFolder, loadNotes } = useNotes();
  const { folderId } = route.params;

  const [showAddNoteModal, setShowAddNoteModal] = React.useState(false);
  const [isAdding, setIsAdding] = React.useState(false);
  const [folderNotes, setFolderNotes] = useState<any[]>([]);

  // Klasör bilgisi
  const folder = notes.find(n => n.id.toString() === folderId && n.isFolder);
  const notesWithoutFolder = notes.filter(n => !n.folderId && !n.isFolder);

  // Klasöre ait notları backend'den çek
  useEffect(() => {
    const fetchFolderNotes = async () => {
      try {
        const res = await apiClient.get(`/folder/${folderId}/notes`);
        setFolderNotes(res.data);
      } catch (err) {
        setFolderNotes([]);
      }
    };
    fetchFolderNotes();
  }, [folderId, showAddNoteModal]);

  // Notu klasörden çıkarma fonksiyonu
  const handleRemoveNoteFromFolder = async (noteId: string | number) => {
    try {
      await apiClient.delete(`/folder/${folderId}/notes/${noteId}`);
      // Notları tekrar çek
      const res = await apiClient.get(`/folder/${folderId}/notes`);
      setFolderNotes(res.data);
    } catch (err) {
      // Hata yönetimi eklenebilir
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Breadcrumb */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: '#f6f7fa' }}>
        <Text
          style={{ color: '#888', fontSize: 15 }}
          onPress={() => navigation.goBack()}
        >
          Home
        </Text>
        <Text style={{ color: '#888', marginHorizontal: 4 }}>/</Text>
        <Text style={{ color: '#228be6', fontWeight: 'bold', fontSize: 15 }}>{folder?.title || 'Klasör'}</Text>
        <TouchableOpacity
          style={{ marginLeft: 'auto', backgroundColor: '#4C6EF5', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14 }}
          onPress={() => setShowAddNoteModal(true)}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Not Ekle</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 22, fontWeight: 'bold', margin: 16 }}>{folder?.title || 'Klasör'}</Text>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {folderNotes.length === 0 ? (
          <Text style={{ color: '#888', fontStyle: 'italic' }}>Bu klasörde hiç not yok.</Text>
        ) : (
          folderNotes.map(note => (
            <View
              key={note.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 14,
                backgroundColor: '#F8F9FA',
                borderRadius: 14,
                padding: 10,
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View style={{ flex: 1 }}>
                <NoteCard
                  note={{
                    id: note.id.toString(),
                    title: note.title,
                    content: note.content || '',
                    isImportant: note.isPinned || false,
                    updatedAt: new Date(note.updatedAt),
                    isPdf: note.isPdf,
                    pdfUrl: note.pdfUrl,
                    pdfName: note.pdfName,
                    coverImage: note.coverImage && note.coverImage.uri ? { uri: note.coverImage.uri } : undefined
                  }}
                  category={{
                    id: note.category?.toString() || '',
                    name: '',
                    color: undefined
                  }}
                  onPress={() => navigation.navigate('NoteDetail', { noteId: note.id.toString() })}
                  onLongPress={() => {}}
                />
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveNoteFromFolder(note.id)}
                style={{
                  marginLeft: 10,
                  backgroundColor: '#FFE3E3',
                  borderRadius: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  alignSelf: 'flex-start',
                }}
              >
                <Text style={{ color: '#FA5252', fontSize: 13, fontWeight: 'bold' }}>Klasörden Çıkar</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Not Ekle Modalı */}
      <Modal visible={showAddNoteModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, minWidth: 280, maxWidth: 340 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Notu Klasöre Ekle</Text>
            <ScrollView style={{ maxHeight: 220 }}>
              {notesWithoutFolder.length === 0 && (
                <Text style={{ color: '#888', fontStyle: 'italic' }}>Klasörsüz not yok.</Text>
              )}
              {notesWithoutFolder.map(note => (
                <TouchableOpacity
                  key={note.id}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6, backgroundColor: '#f6f7fa' }}
                  disabled={isAdding}
                  onPress={async () => {
                    setIsAdding(true);
                    await moveNoteToFolder(note.id, folderId);
                    await loadNotes();
                    setIsAdding(false);
                    setShowAddNoteModal(false);
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{note.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <TouchableOpacity onPress={() => setShowAddNoteModal(false)}>
                <Text style={{ color: '#888' }}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FolderDetailScreen; 