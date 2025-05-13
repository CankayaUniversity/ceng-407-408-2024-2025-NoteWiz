import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ShareNoteScreenRouteProp, ShareNoteScreenNavigationProp } from '../types/navigation';
import { useShares } from '../contexts/ShareContext';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { SearchIcon, ShareIcon, UserIcon } from '../components/icons';

const ShareNoteScreen = () => {
  const route = useRoute<ShareNoteScreenRouteProp>();
  const navigation = useNavigation<ShareNoteScreenNavigationProp>();
  const { noteId } = route.params;
  const { shareNote, getNoteShares, loading, error } = useShares();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [existingShares, setExistingShares] = useState<any[]>([]);

  // Örnek kullanıcı listesi - Gerçek uygulamada API'den gelecek
  const [users] = useState([
    { id: 1, fullName: 'John Doe', email: 'john@example.com' },
    { id: 2, fullName: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, fullName: 'Alice Johnson', email: 'alice@example.com' },
  ]);

  useEffect(() => {
    loadExistingShares();
  }, [noteId]);

  const loadExistingShares = async () => {
    try {
      const shares = await getNoteShares(noteId);
      setExistingShares(shares);
    } catch (err) {
      console.error('Error loading shares:', err);
    }
  };

  const filteredUsers = users.filter(user => {
    const isAlreadyShared = existingShares.some(share => share.sharedWithUserId === user.id);
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return !isAlreadyShared && matchesSearch;
  });

  const handleUserSelect = (user: any) => {
    const isSelected = selectedUsers.some(u => u.id === user.id);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir kullanıcı seçin');
      return;
    }

    try {
      for (const user of selectedUsers) {
        await shareNote(noteId, {
          sharedWithUserId: user.id,
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

  const renderUserItem = ({ item }: { item: any }) => {
    const isSelected = selectedUsers.some(user => user.id === item.id);

    return (
      <TouchableOpacity
        style={[styles.userCard, isSelected && styles.userCardSelected]}
        onPress={() => handleUserSelect(item)}
      >
        <View style={styles.userIcon}>
          <UserIcon size={24} color={COLORS.primary.main} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.fullName}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchIcon size={20} color={COLORS.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Kullanıcı ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
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
            trackColor={{ false: COLORS.neutral[300], true: COLORS.primary.light }}
            thumbColor={canEdit ? COLORS.primary.main : COLORS.neutral[100]}
          />
        </View>

        <TouchableOpacity
          style={[styles.shareButton, selectedUsers.length === 0 && styles.shareButtonDisabled]}
          onPress={handleShare}
          disabled={selectedUsers.length === 0}
        >
          <ShareIcon size={20} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>
            {selectedUsers.length > 0
              ? `${selectedUsers.length} Kişi ile Paylaş`
              : 'Paylaş'}
          </Text>
        </TouchableOpacity>
      </View>
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
    ...TYPOGRAPHY.subtitle1,
    color: COLORS.text.primary,
  },
  userEmail: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
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
    backgroundColor: COLORS.neutral[300],
  },
  shareButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.inverted,
    marginLeft: SPACING.sm,
  },
});

export default ShareNoteScreen; 