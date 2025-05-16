import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { askAI } from '../services/openai';

const TAB_BAR_HEIGHT = 72; // Tab bar yüksekliği + biraz boşluk

const AIChatScreen = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }]);
    setLoading(true);
    try {
      const aiResponse = await askAI(input);
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Bir hata oluştu.' }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <Text style={styles.header}>AI Sohbet</Text>
      <ScrollView
        style={{ flex: 1, marginBottom: TAB_BAR_HEIGHT + 56 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 0 }}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg, idx) => (
          <View key={idx} style={[styles.message, msg.role === 'user' ? styles.userMsg : styles.aiMsg]}>
            <Text style={{ color: msg.role === 'user' ? '#FFF' : '#222' }}>{msg.text}</Text>
          </View>
        ))}
        {loading && <ActivityIndicator size="small" color="#4C6EF5" style={{ marginTop: 8 }} />}
      </ScrollView>
      <View style={styles.inputAreaFixed}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="AI'ye mesaj yaz..."
          onSubmitEditing={sendMessage}
          editable={!loading}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Gönder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 16, color: '#4C6EF5' },
  message: { padding: 12, borderRadius: 8, marginBottom: 8, maxWidth: '80%' },
  userMsg: { backgroundColor: '#4C6EF5', alignSelf: 'flex-end' },
  aiMsg: { backgroundColor: '#E9ECEF', alignSelf: 'flex-start' },
  inputAreaFixed: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 88 : 72, // Tab bar yüksekliği + biraz boşluk
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  input: { flex: 1, borderWidth: 1, borderColor: '#E9ECEF', borderRadius: 8, padding: 10, marginRight: 8, backgroundColor: '#FFF' },
  sendBtn: { backgroundColor: '#4C6EF5', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
});

export default AIChatScreen; 