import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { apiClient } from '../services/newApi';
import { useAuth } from '../contexts/AuthContext';

// Tip tanımı ekle
interface FriendRequest {
  id: number;
  sender?: { username?: string };
  receiverId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const FriendRequestsScreen = ({ onRequestCountChange }: { onRequestCountChange?: (count: number) => void }) => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      if (!user) return;
      const res = await apiClient.get('/friendship/requests');
      const pending = res.data.filter((r: FriendRequest) => r.status === 'Pending' && r.receiverId === user.id);
      setRequests(pending);
      if (onRequestCountChange) onRequestCountChange(pending.length);
    } catch (err) {
      setRequests([]);
      if (onRequestCountChange) onRequestCountChange(0);
      Alert.alert('Hata', 'İstekler alınamadı.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const respondRequest = async (id: number, status: string) => {
    try {
      await apiClient.put(`/friendship/requests/${id}`, { status });
      Alert.alert(
        'Başarılı',
        `İstek ${status === 'Accepted' ? 'kabul edildi' : 'reddedildi'}.`,
        [{ text: 'OK', onPress: fetchRequests }]
      );
    } catch (err) {
      Alert.alert('Hata', 'İşlem başarısız.');
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gelen Arkadaşlık İstekleri</Text>
      <FlatList
        data={requests}
        keyExtractor={(item: FriendRequest) => item.id.toString()}
        renderItem={({ item }: { item: FriendRequest }) => (
          <View style={styles.requestItem}>
            <Text>{item.sender?.username || 'Kullanıcı'} size istek gönderdi</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#4C6EF5' }]}
                onPress={() => respondRequest(item.id, 'Accepted')}
              >
                <Text style={styles.buttonText}>Kabul Et</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#FF3B30' }]}
                onPress={() => respondRequest(item.id, 'Rejected')}
              >
                <Text style={styles.buttonText}>Reddet</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>Bekleyen istek yok.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  requestItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  buttonRow: { flexDirection: 'row', marginTop: 8 },
  button: { flex: 1, marginHorizontal: 4, padding: 8, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default FriendRequestsScreen;