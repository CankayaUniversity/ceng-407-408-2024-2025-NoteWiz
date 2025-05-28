import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { apiClient } from '../services/newApi'; // Kendi api servis dosyanı kullan

const FriendSearchScreen = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Kullanıcı arama fonksiyonu
  const searchUsers = async () => {
    setLoading(true);
    try {
      console.log('API çağrısı başlıyor:', `/users/search?username=${search}`);
      const res = await apiClient.get(`/users/search?username=${search}`);
      console.log('API yanıtı:', res.data);
      setResults(res.data);
    } catch (err) {
      console.error('API HATASI:', err);
      Alert.alert('Hata', 'Kullanıcılar aranırken bir hata oluştu.');
    }
    setLoading(false);
  };

  // Arkadaşlık isteği gönderme fonksiyonu
  const sendFriendRequest = async (targetUserId: number) => {
    try {
      // Giriş yapan kullanıcının id'sini kendi AuthContext'inden alabilirsin
      // const requesterId = user.id;
      // Eğer backend JWT ile kimlik doğruluyorsa, sadece targetUserId göndermen yeterli olabilir!
      await apiClient.post('/friendship/requests', {
        receiverId: targetUserId
      });
      Alert.alert('Başarılı', 'Arkadaşlık isteği gönderildi!');
    } catch (err) {
      Alert.alert('Hata', 'İstek gönderilemedi veya zaten istek var.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kullanıcı Ara</Text>
      <TextInput
        style={styles.input}
        placeholder="Kullanıcı adı gir"
        value={search}
        onChangeText={setSearch}
      />
      <Button title="Ara" onPress={searchUsers} disabled={loading} />
      <FlatList
        data={results}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <Text>{item.userName || item.username}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => sendFriendRequest(item.id)}
            >
              <Text style={styles.addButtonText}>İstek Gönder</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 12 },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  addButton: { backgroundColor: '#4C6EF5', padding: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default FriendSearchScreen;