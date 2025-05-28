import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { apiClient } from '../services/newApi';
import { useAuth } from '../contexts/AuthContext';

interface Friend {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  isFavorite: boolean;
  notificationsOn?: boolean;
}

const FriendsListScreen = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFriends = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await apiClient.get('/friendship');
      console.log('API yanıtı:', res.data);
      const allFriends: Friend[] = res.data.map((f: any) => {
        if (f.friend && f.friend.id !== user.id) return f.friend;
        if (f.user && f.user.id !== user.id) return f.user;
        return null;
      }).filter((f: Friend | null) => f && f.id !== user.id);
      const uniqueFriends: Friend[] = Array.from(new Map(allFriends.map(f => [f.id, f])).values());
      setFriends(uniqueFriends as Friend[]);
    } catch (err) {
      setFriends([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // Bildirim aç/kapat
  const toggleNotification = (id: number) => {
    setFriends(friends => friends.map(f => f.id === id ? { ...f, notificationsOn: !f.notificationsOn } : f));
  };

  // Arşivle
  const archiveFolder = (id: number) => {
    setFriends(friends => friends.filter(f => f.id !== id)); // Basitçe listeden çıkar
  };

  // Favori
  const toggleFavorite = (id: number) => {
    setFriends(friends => friends.map(f => f.id === id ? { ...f, isFavorite: !f.isFavorite } : f));
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Arkadaşlarım ({friends.length})</Text>
      <FlatList
        data={friends}
        keyExtractor={item => `${item.id}_${item.username}`}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <Text style={styles.friendName}>{item.fullName || item.username}</Text>
            <Text style={styles.friendUsername}>@{item.username}</Text>
            <TouchableOpacity onPress={() => toggleNotification(item.id)}>
              <Text>{item.notificationsOn ? 'Bildirim Kapalı' : 'Bildirim Açık'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => archiveFolder(item.id)}>
              <Text>Arşivle</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
              <Text>{item.isFavorite ? '★' : '☆'}</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>Hiç arkadaşın yok.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  friendItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  friendName: { fontSize: 16, fontWeight: '600' },
  friendUsername: { fontSize: 14, color: '#888' },
});

export default FriendsListScreen; 