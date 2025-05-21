import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Switch,
  Modal,
} from 'react-native';

import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { ShareNoteScreenRouteProp, ShareNoteScreenNavigationProp } from '../types/navigation';
import { useShares } from '../contexts/ShareContext';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { SearchIcon, ShareIcon } from '../components/icons';
import { friendshipService } from '../services/newApi';
import { apiClient } from '../services/newApi';
import * as signalR from '@microsoft/signalr';
import { API_URL } from '../config/api';

interface Friend {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
}

const ShareNoteScreen = () => {
  const route = useRoute<ShareNoteScreenRouteProp>();
  const navigation = useNavigation<ShareNoteScreenNavigationProp>();
  const noteId = route?.params?.noteId;
  console.log('ShareNoteScreen noteId:', noteId);
  const refreshOnFocus = route?.params?.refreshOnFocus;
  const { shareNote, getNoteShares, loading, error } = useShares();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [existingShares, setExistingShares] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [emailToShare, setEmailToShare] = useState<string | null>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareMethod, setShareMethod] = useState<'friends' | 'email' | 'other' | null>(null);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [noteContent, setNoteContent] = useState<string>('');
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!noteId) {
      console.error('noteId is undefined!');
      return;
    }
    loadExistingShares();
    fetchFriends();
  }, [noteId]);

  useFocusEffect(
    React.useCallback(() => {
      if (refreshOnFocus && noteId) {
        loadExistingShares();
      }
    }, [refreshOnFocus, noteId])
  );

  useEffect(() => {
    if (!noteId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/notehub`, {
        accessTokenFactory: () => user?.token || '' // Eğer JWT ile korumalıysa
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection.start().then(() => {
      connection.invoke('JoinNoteSession', noteId);
    });

    connection.on('NoteUpdated', (content: string) => {
      setNoteContent(content); // Anlık güncelleme
    });

    return () => {
      connection.invoke('LeaveNoteSession', noteId);
      connection.stop();
    };
  }, [noteId]);

  const loadExistingShares = async () => {
    if (!noteId) {
      console.error('loadExistingShares: noteId is undefined!');
      setExistingShares([]);
      return;
    }
    try {
      const shares = await getNoteShares(noteId);
      console.log('API shares response:', shares);
      if (!Array.isArray(shares)) {
        setExistingShares([]);
        return;
      }
      setExistingShares(shares);
    } catch (err) {
      console.error('Error loading shares:', err);
    }
  };

  const fetchFriends = async () => {
    if (!user) return;
    try {
      const res = await apiClient.get('/friendship');
      const allFriends: Friend[] = res.data.map((f: any) => {
        if (f.friend && f.friend.id !== user.id) return f.friend;
        if (f.user && f.user.id !== user.id) return f.user;
        return null;
      }).filter((f: Friend | null) => f && f.id !== user.id);
      const uniqueFriends: Friend[] = Array.from(new Map(allFriends.map(f => [f.id, f])).values());
      setUsers(uniqueFriends as Friend[]);
    } catch (err) {
      setUsers([]);
    }
  };

  const filteredUsers = users.filter(user => {
    const isAlreadyShared = existingShares.some(
      share => {
        const sharedId = String(share.sharedWithUserId);
        const userId = String(user.id);
        if (sharedId === userId) {
          console.log('Zaten paylaşılmış:', { sharedId, userId });
        }
        return sharedId === userId;
      }
    );
    const matchesSearch =
      (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return !isAlreadyShared && matchesSearch;
  });

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const showEmailShareOption =
    searchQuery.length > 0 &&
    isValidEmail(searchQuery);

  const handleUserSelect = (user: any) => {
    const isSelected = selectedUsers.some(u => u.id === user.id);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
    setEmailToShare(null);
  };

  const handleEmailShareSelect = () => {
    setSelectedUsers([]);
    setEmailToShare(searchQuery);
  };

  const handleShare = async () => {
    if (!noteId) {
      Alert.alert('Hata', 'Note ID bulunamadı!');
      return;
    }
    if (selectedUsers.length === 0 && !emailToShare) {
      Alert.alert('Uyarı', 'Lütfen en az bir kullanıcı veya e-posta seçin');
      return;
    }
    try {
      for (const user of selectedUsers) {
        await shareNote(noteId, {
          sharedWithUserId: user.id,
          canEdit,
        });
      }
      if (emailToShare) {
        await shareNote(noteId, {
          sharedWithEmail: emailToShare,
          canEdit,
        });
      }
      Alert.alert('Başarılı', 'Not başarıyla paylaşıldı');
      navigation.goBack();
    } catch (err) {
      console.error('Error sharing note:', err);
      Alert.alert('Hata', 'Not paylaşılırken bir hata oluştu');
    }
  };

  const handleContentChange = (text: string) => {
    setNoteContent(text);
    // SignalR ile diğer kullanıcılara bildir
    connectionRef.current?.invoke('UpdateNote', noteId, text);
  };

  const renderUserItem = ({ item }: { item: any }) => {
    const isSelected = selectedUsers.some(user => user.id === item.id);

    return (
      <TouchableOpacity
        style={[styles.userCard, isSelected && styles.userCardSelected]}
        onPress={() => handleUserSelect(item)}
      >
        <View style={styles.userIcon}>
          {/* UserIcon ile ilgili satırı kaldırıyorum:
          <UserIcon size={24} color={COLORS.primary.main} /> */}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.fullName}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const openShareModal = () => setShareModalVisible(true);
  const closeShareModal = () => setShareModalVisible(false);

  const handleShareMethodSelect = (method: 'friends' | 'email' | 'other') => {
    setShareMethod(method);
    setShareModalVisible(false);
    if (method === 'email') setEmailModalVisible(true);
  };

  const closeEmailModal = () => {
    setEmailModalVisible(false);
    setShareMethod(null);
    setSearchQuery('');
  };

  if (!noteId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', fontSize: 18 }}>Not bulunamadı veya parametre eksik!</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
      </View>
    );
  }

  const renderShareModal = () => (
    <Modal
      visible={shareModalVisible}
      transparent
      animationType="slide"
      onRequestClose={closeShareModal}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '80%' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>Nasıl paylaşmak istersin?</Text>
          <TouchableOpacity style={{ marginBottom: 16, backgroundColor: COLORS.primary.main, borderRadius: 8, padding: 16 }} onPress={() => handleShareMethodSelect('friends')}>
            <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Arkadaşlarım ile paylaş</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginBottom: 16, backgroundColor: COLORS.primary.main, borderRadius: 8, padding: 16 }} onPress={() => handleShareMethodSelect('email')}>
            <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>E-posta ile paylaş</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: COLORS.primary.light, borderRadius: 8, padding: 16 }} onPress={() => handleShareMethodSelect('other')}>
            <Text style={{ color: COLORS.primary.main, fontWeight: 'bold', textAlign: 'center' }}>Diğer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 16, alignSelf: 'center' }} onPress={closeShareModal}>
            <Text style={{ color: COLORS.text.secondary }}>Vazgeç</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderEmailShareModal = () => (
    <Modal
      visible={emailModalVisible}
      transparent
      animationType="fade"
      onRequestClose={closeEmailModal}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '80%' }}>
          <Text style={{ fontSize: 16, marginBottom: 16, textAlign: 'center' }}>E-posta adresi gir:</Text>
          <TextInput
            style={{
              width: '100%',
              marginBottom: 24,
              color: '#222',
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 12,
              fontSize: 16
            }}
            placeholder="ornek@mail.com"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity
            style={[styles.shareButton, !isValidEmail(searchQuery) && styles.shareButtonDisabled]}
            onPress={async () => {
              if (!isValidEmail(searchQuery)) return;
              setEmailToShare(searchQuery);
              await handleShare();
              closeEmailModal();
            }}
            disabled={!isValidEmail(searchQuery)}
          >
            <ShareIcon size={20} color={COLORS.text.primary} />
            <Text style={styles.shareButtonText}>E-posta ile Paylaş</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 16, alignSelf: 'center' }} onPress={closeEmailModal}>
            <Text style={{ color: COLORS.text.secondary }}>Vazgeç</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderFriendsShare = () => (
    <>
      <View style={styles.searchContainer}>
        <SearchIcon size={20} color={COLORS.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Kullanıcı ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Kullanıcı bulunamadı' : 'Paylaşılabilecek kullanıcı yok'}
            </Text>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.permissionToggle}>
          <Text style={styles.permissionText}>Düzenleme izni ver</Text>
          <Switch
            value={canEdit}
            onValueChange={setCanEdit}
            trackColor={{ false: COLORS.primary.light, true: COLORS.primary.main }}
            thumbColor={canEdit ? COLORS.primary.main : COLORS.primary.light}
          />
        </View>
        <TouchableOpacity
          style={[styles.shareButton, selectedUsers.length === 0 && styles.shareButtonDisabled]}
          onPress={handleShare}
          disabled={selectedUsers.length === 0}
        >
          <ShareIcon size={20} color={COLORS.text.primary} />
          <Text style={styles.shareButtonText}>
            {selectedUsers.length > 0
              ? `${selectedUsers.length} Kişi ile Paylaş`
              : 'Paylaş'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderOtherShare = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ fontSize: 16, marginBottom: 16 }}>Paylaşım linki oluştur:</Text>
      <TouchableOpacity
        style={styles.shareButton}
        onPress={() => {
          Alert.alert('Link paylaşımı', 'Bu özellik yakında!');
        }}
      >
        <ShareIcon size={20} color={COLORS.text.primary} />
        <Text style={styles.shareButtonText}>Link Kopyala</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ marginTop: 16 }} onPress={() => setShareMethod(null)}>
        <Text style={{ color: COLORS.text.secondary }}>Geri dön</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderShareModal()}
      {renderEmailShareModal()}
      {shareMethod === 'friends' && renderFriendsShare()}
      {shareMethod === 'other' && renderOtherShare()}
      {shareMethod === null && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.shareButton} onPress={openShareModal}>
            <ShareIcon size={20} color={COLORS.text.primary} />
            <Text style={styles.shareButtonText}>Paylaş</Text>
          </TouchableOpacity>
        </View>
      )}
      <TextInput
        value={noteContent}
        onChangeText={handleContentChange}
        multiline
        style={{ minHeight: 120, backgroundColor: '#fff', borderRadius: 8, padding: 12 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.paper,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background.surface,
    margin: SPACING.md,
    borderRadius: 12,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '400',
  },
  errorContainer: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.error.light,
    borderRadius: 8,
  },
  errorText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.error.main,
    fontWeight: 400,
  },
  listContent: {
    padding: SPACING.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background.surface,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  userCardSelected: {
    backgroundColor: COLORS.primary.light,
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: 400,
  },
  userEmail: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontWeight: 400,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontWeight: 400,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  permissionToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  permissionText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: 400,
  },
  shareButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary.main,
    padding: SPACING.md,
    borderRadius: 12,
  },
  shareButtonDisabled: {
    backgroundColor: COLORS.primary.light,
  },
  shareButtonText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
    fontWeight: 400,
  },
});

export default ShareNoteScreen; 