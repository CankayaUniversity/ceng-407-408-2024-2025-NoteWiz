import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput } from 'react-native';

// Temel klasör tipi
export interface Folder {
  id: string;
  name: string;
  color: string;
<<<<<<< HEAD
  icon?: string;
=======
  icon: string;
>>>>>>> 2919ceb5cf3c0d83b6677f30839892951700aa7c
  parentId?: string;
  children?: Folder[];
  isArchived?: boolean;
}

export interface Note {
  id: string;
  title: string;
  content?: string;
  folderId: string;
}

const defaultIcons = ['📁', '📂', '🗂️', '⭐', '📝'];
const defaultColors = ['#4C6EF5', '#FFD43B', '#63E6BE', '#FF8787', '#845EF7'];

const initialFolders: Folder[] = [
  { id: '1', name: 'Genel', color: '#4C6EF5', icon: '📁', children: [] },
  { id: '2', name: 'Arşiv', color: '#FFD43B', icon: '🗂️', isArchived: true, children: [] },
];

function buildTree(folders: Folder[], parentId?: string): Folder[] {
  return folders
    .filter(f => f.parentId === parentId)
    .map(f => ({ ...f, children: buildTree(folders, f.id) }));
}

const FolderList = ({ onSelect }: { onSelect?: (folder: Folder) => void }) => {
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(defaultColors[0]);
  const [selectedIcon, setSelectedIcon] = useState(defaultIcons[0]);
  const [parentId, setParentId] = useState<string | undefined>(undefined);

  const addFolder = () => {
    if (!newFolderName.trim()) return;
    setFolders([...folders, {
      id: Date.now().toString(),
      name: newFolderName,
      color: selectedColor,
      icon: selectedIcon,
      parentId,
      children: [],
    }]);
    setNewFolderName('');
    setParentId(undefined);
  };

  const deleteFolder = (id: string) => {
    setFolders(folders.filter(f => f.id !== id && f.parentId !== id)); // Alt klasörleri de sil
  };

  const renderTree = (nodes: Folder[], level = 0) => (
    <>
      {nodes.map(node => (
        <View key={node.id} style={{ marginLeft: level * 16 }}>
          <TouchableOpacity style={[styles.folder, { backgroundColor: node.color }]} onPress={() => onSelect?.(node)}>
            <Text style={styles.icon}>{node.icon}</Text>
            <Text style={styles.name}>{node.name}</Text>
            <TouchableOpacity onPress={() => deleteFolder(node.id)}>
              <Text style={styles.delete}>Sil</Text>
            </TouchableOpacity>
          </TouchableOpacity>
          {node.children && node.children.length > 0 && renderTree(node.children, level + 1)}
        </View>
      ))}
    </>
  );

  const tree = buildTree(folders.filter(f => !f.isArchived));
  const archived = folders.filter(f => f.isArchived);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Klasörler</Text>
      {renderTree(tree)}
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={newFolderName}
          onChangeText={setNewFolderName}
          placeholder="Yeni klasör adı"
        />
        <TouchableOpacity onPress={addFolder} style={styles.addBtn}>
          <Text style={{ color: '#FFF' }}>Ekle</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        {defaultColors.map(c => (
          <TouchableOpacity key={c} onPress={() => setSelectedColor(c)} style={[styles.color, { backgroundColor: c, borderWidth: selectedColor === c ? 2 : 0 }]} />
        ))}
        {defaultIcons.map(i => (
          <TouchableOpacity key={i} onPress={() => setSelectedIcon(i)} style={styles.iconPick}>
            <Text style={{ fontSize: 20 }}>{i}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.addRow}>
        <Text style={{ marginRight: 8 }}>Üst klasör:</Text>
        <TouchableOpacity onPress={() => setParentId(undefined)} style={[styles.parentPick, !parentId && { backgroundColor: '#E9ECEF' }]}> 
          <Text>Kök</Text>
        </TouchableOpacity>
        {folders.filter(f => !f.isArchived).map(f => (
          <TouchableOpacity key={f.id} onPress={() => setParentId(f.id)} style={[styles.parentPick, parentId === f.id && { backgroundColor: '#E9ECEF' }]}> 
            <Text>{f.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.header}>Arşiv</Text>
      <FlatList
        data={archived}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.folder, { backgroundColor: item.color, opacity: 0.6 }]}> 
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.name}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontWeight: 'bold', fontSize: 18, marginVertical: 8 },
  folder: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 8 },
  icon: { fontSize: 20, marginRight: 8 },
  name: { flex: 1, fontSize: 16 },
  delete: { color: '#FF4D4F', fontWeight: 'bold', marginLeft: 8 },
  addRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, flexWrap: 'wrap' },
  input: { flex: 1, borderWidth: 1, borderColor: '#E9ECEF', borderRadius: 8, padding: 8, marginRight: 8 },
  addBtn: { backgroundColor: '#4C6EF5', borderRadius: 8, padding: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  color: { width: 24, height: 24, borderRadius: 12, marginHorizontal: 4, borderColor: '#222' },
  iconPick: { marginHorizontal: 4 },
  parentPick: { padding: 8, borderRadius: 8, backgroundColor: '#F1F3F5', marginRight: 8, marginBottom: 4 },
});

export default FolderList; 