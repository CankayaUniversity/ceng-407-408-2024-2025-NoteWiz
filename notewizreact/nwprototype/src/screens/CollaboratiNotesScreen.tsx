import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { apiClient } from '../services/newApi';
import { useAuth } from '../contexts/AuthContext';
// @ts-ignore: Vector icons için tip bildirimi yoksa hata alma
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

const PINK = '#F06595';
const LIGHT_PINK = '#FFF0F6';
const GREEN = '#40C057';
const LIGHT_GREEN = '#EBFAEF';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SharedNotes'>;

const CollaboratiNotesScreen = ({ navigation }: { navigation: NavigationProp }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'sharedByMe' | 'sharedWithMe'>('sharedWithMe');
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: 'Eş Zamanlı Notlar' });
  }, [navigation]);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        let res;
        if (activeTab === 'sharedWithMe') {
          res = await apiClient.get('/notes/shared');
          setNotes(res.data);
        } else {
          res = await apiClient.get('/notes');
          console.log('Paylaştığım notlar:', res.data);
          setNotes(res.data.filter((note: any) => note.sharedWith && note.sharedWith.length > 0));
        }
        console.log('API notes response:', res.data);
      } catch (err) {
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [activeTab]);

  const renderItem = ({ item }: { item: any }) => {
    const noteId = item.id || item.noteId;
    if (!noteId) {
      console.warn('Not kartında id veya noteId yok:', item);
      return null;
    }
    const canEdit = item.canEdit === true || (Array.isArray(item.sharedWith) && item.sharedWith.some((sw: any) => sw.canEdit));
    const barColor = canEdit ? PINK : GREEN;
    const cardBg = canEdit ? LIGHT_PINK : LIGHT_GREEN;
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cardBg }]}
        onPress={() => {
          console.log('Navigating to NoteDetail with noteId:', noteId);
          navigation.navigate('NoteDetail', { noteId, canEdit });
        }}
      >
        <View style={[styles.bar, { backgroundColor: barColor }]} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="groups" size={28} color="#4F8EF7" style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>Paylaşan: {item.sharedBy?.fullName || item.sharedBy?.username || item.user?.fullName || 'Bilinmiyor'}</Text>
            <Text style={styles.meta}>Son güncelleme: {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, padding: 0, backgroundColor: '#F7F9FB' }}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sharedWithMe' && styles.tabActive]}
          onPress={() => setActiveTab('sharedWithMe')}
        >
          <Text style={[styles.tabText, activeTab === 'sharedWithMe' && styles.tabTextActive]}>Benimle Paylaşılanlar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sharedByMe' && styles.tabActive]}
          onPress={() => setActiveTab('sharedByMe')}
        >
          <Text style={[styles.tabText, activeTab === 'sharedByMe' && styles.tabTextActive]}>Paylaştığım Notlar</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 4 }}>
        <View style={{ width: 18, height: 8, backgroundColor: '#FF69B4', borderRadius: 2, marginRight: 4 }} />
        <Text style={{ fontSize: 12, color: '#888', marginRight: 12 }}>Düzenleme Yetkisi</Text>
        <View style={{ width: 18, height: 8, backgroundColor: '#4CAF50', borderRadius: 2, marginRight: 4 }} />
        <Text style={{ fontSize: 12, color: '#888' }}>Sadece Görüntüleme</Text>
      </View>
      <Text style={styles.sectionTitle}>Eş Zamanlı Notlar</Text>
      <FlatList
        data={notes}
        keyExtractor={item => ((item.id || item.noteId) ? (item.id || item.noteId).toString() : Math.random().toString())}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>Henüz not yok.</Text>}
        contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 8 }}
        refreshing={loading}
        onRefresh={() => setActiveTab(activeTab)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 0,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  tabActive: {
    backgroundColor: '#4F8EF7',
  },
  tabText: {
    textAlign: 'center',
    color: '#4F8EF7',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#fff',
  },
  card: {
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bar: {
    height: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginBottom: 8,
    marginHorizontal: -18,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  meta: {
    fontSize: 13,
    color: '#4F8EF7',
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
    marginLeft: 16,
    marginTop: 8,
  },
});

export default CollaboratiNotesScreen; 